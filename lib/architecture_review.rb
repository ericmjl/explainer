# frozen_string_literal: true

require "json"
require "digest"
require "securerandom"
require "webrick"

require_relative "architecture_edit"
require_relative "strict_yaml"

# Loopback-only adapter for the human review workspace. The browser submits
# typed edit plans; this class never accepts a filesystem path or arbitrary
# YAML mutation from HTTP.
module ArchitectureReview
  class Error < StandardError
    attr_reader :code, :status

    def initialize(code, message, status: 400)
      @code = code
      @status = status
      super(message)
    end
  end

  class Workspace
    MAX_REQUEST_BYTES = 1_000_000
    VALIDATED_TRANSACTION_TTL_SECONDS = 5 * 60
    MAX_VALIDATED_TRANSACTIONS = 16

    ValidatedTransaction = Struct.new(
      :id,
      :prepared_plan,
      :prepared_plan_digest,
      :result,
      :session_digest,
      :created_at,
      :expires_at,
      keyword_init: true,
    )
    private_constant :ValidatedTransaction

    attr_reader :token

    def initialize(
      root: ArchitectureEdit::ROOT,
      compiler: nil,
      token: nil,
      transaction_ttl: VALIDATED_TRANSACTION_TTL_SECONDS,
      max_transactions: MAX_VALIDATED_TRANSACTIONS,
      clock: nil
    )
      @root = File.expand_path(root)
      @compiler = compiler || ArchitectureEdit::Compiler.new(root: @root)
      @token = token || SecureRandom.hex(24)
      @transaction_ttl = Float(transaction_ttl)
      @max_transactions = Integer(max_transactions)
      raise ArgumentError, "transaction_ttl must be positive" unless @transaction_ttl.positive?
      raise ArgumentError, "max_transactions must be positive" unless @max_transactions.positive?

      @clock = clock || -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }
      @transaction_lock = Mutex.new
      @validated_transactions = {}
    end

    def source_sets
      registry.fetch("source_sets").map do |source_set|
        {
          "id" => source_set.fetch("id"),
          "label" => source_set.fetch("label"),
          "directory_role" => source_set.fetch("directory_role"),
        }
      end
    end

    def source_snapshot(source_set_id)
      source_set = resolve_source_set(source_set_id)
      {
        "source_set" => {
          "id" => source_set.fetch("id"),
          "label" => source_set.fetch("label"),
        },
        "architecture" => read_yaml(source_set.fetch("architecture")),
        "view" => read_yaml(source_set.fetch("view")),
      }
    end

    def preview(plan)
      prepared, result = if @compiler.respond_to?(:prepare_and_preview)
        @compiler.prepare_and_preview(plan)
      else
        legacy_prepare_and_preview(plan)
      end
      transaction_id = cache_validated_transaction(prepared, result)
      {
        "prepared_plan" => deep_copy(prepared),
        "transaction_id" => transaction_id,
        "transaction_expires_in_seconds" => @transaction_ttl,
        "preview" => result.to_h,
        "report" => result.to_text,
      }
    end

    # Backward-compatible direct application for CLI callers and older tests.
    # The review HTTP API uses apply_transaction so a browser cannot substitute
    # a different plan after validation.
    def apply(prepared_plan)
      result = @compiler.apply(prepared_plan)
      result_payload(result)
    end

    def apply_transaction(transaction_id)
      transaction = consume_validated_transaction(transaction_id)
      result = if @compiler.respond_to?(:apply_validated)
        @compiler.apply_validated(transaction.prepared_plan, transaction.result)
      else
        @compiler.apply(transaction.prepared_plan)
      end
      result_payload(result)
    end

    private

    def result_payload(result)
      {
        "result" => result.to_h,
        "report" => result.to_text,
      }
    end

    def legacy_prepare_and_preview(plan)
      prepared = @compiler.prepare_plan(plan)
      [prepared, @compiler.preview(prepared, require_digests: true)]
    end

    def cache_validated_transaction(prepared_plan, result)
      now = @clock.call
      transaction_id = SecureRandom.hex(32)
      stored_plan = deep_copy(prepared_plan)
      transaction = ValidatedTransaction.new(
        id: transaction_id,
        prepared_plan: stored_plan,
        prepared_plan_digest: canonical_digest(stored_plan),
        result: result,
        session_digest: Digest::SHA256.hexdigest(@token),
        created_at: now,
        expires_at: now + @transaction_ttl,
      )
      @transaction_lock.synchronize do
        purge_expired_transactions!(now)
        while @validated_transactions.length >= @max_transactions
          oldest_id, = @validated_transactions.min_by { |_id, entry| entry.created_at }
          @validated_transactions.delete(oldest_id)
        end
        @validated_transactions[transaction_id] = transaction
      end
      transaction_id
    end

    def consume_validated_transaction(transaction_id)
      unless transaction_id.is_a?(String) && transaction_id.match?(/\A[a-f0-9]{64}\z/)
        raise Error.new("invalid_review_transaction", "transaction_id is malformed")
      end

      now = @clock.call
      transaction = @transaction_lock.synchronize do
        purge_expired_transactions!(now)
        @validated_transactions.delete(transaction_id)
      end
      unless transaction
        raise Error.new(
          "expired_review_transaction",
          "validated review transaction is expired, unknown, or already consumed; preview again",
          status: 409,
        )
      end
      unless transaction.session_digest == Digest::SHA256.hexdigest(@token) &&
          transaction.prepared_plan_digest == canonical_digest(transaction.prepared_plan)
        raise Error.new(
          "invalid_review_transaction",
          "validated review transaction failed its session or plan binding",
          status: 409,
        )
      end

      transaction
    end

    def purge_expired_transactions!(now)
      @validated_transactions.delete_if { |_id, transaction| transaction.expires_at <= now }
    end

    def canonical_digest(value)
      Digest::SHA256.hexdigest(JSON.generate(canonicalize(value)))
    end

    def canonicalize(value)
      case value
      when Hash
        value.keys.sort.each_with_object({}) do |key, sorted|
          sorted[key] = canonicalize(value.fetch(key))
        end
      when Array
        value.map { |item| canonicalize(item) }
      else
        value
      end
    end

    def deep_copy(value)
      JSON.parse(JSON.generate(value))
    end

    def registry
      @registry ||= StrictYaml.load_file(File.join(@root, ArchitectureEdit::REGISTRY_PATH))
    rescue StrictYaml::Error, Errno::ENOENT => e
      raise Error.new("invalid_registry", e.message, status: 500)
    end

    def resolve_source_set(id)
      unless id.is_a?(String) && id.match?(/\A[a-z][a-z0-9_]*\z/)
        raise Error.new("invalid_source_set", "source_set must be a stable registry ID")
      end
      source_set = registry.fetch("source_sets").find { |candidate| candidate["id"] == id }
      raise Error.new("unknown_source_set", "unknown source set #{id.inspect}", status: 404) unless source_set

      source_set
    end

    def read_yaml(relative)
      path = File.expand_path(relative, @root)
      unless path.start_with?("#{@root}/")
        raise Error.new("unsafe_registry_path", "registry path escapes the repository", status: 500)
      end
      StrictYaml.load_file(path)
    rescue StrictYaml::Error, Errno::ENOENT => e
      raise Error.new("invalid_source", e.message, status: 500)
    end
  end

  class Server
    JSON_HEADERS = {
      "Content-Type" => "application/json; charset=utf-8",
      "Cache-Control" => "no-store",
      "X-Content-Type-Options" => "nosniff",
    }.freeze

    attr_reader :port

    def initialize(root: ArchitectureEdit::ROOT, port: 4777, logger: nil, access_log: [])
      @root = File.expand_path(root)
      @workspace = Workspace.new(root: @root)
      @server = WEBrick::HTTPServer.new(
        BindAddress: "127.0.0.1",
        Port: Integer(port),
        DocumentRoot: @root,
        Logger: logger || WEBrick::Log.new(File::NULL, WEBrick::Log::WARN),
        AccessLog: access_log,
      )
      @port = @server.config.fetch(:Port)
      mount_routes
    end

    def start
      @server.start
    end

    def shutdown
      @server.shutdown
    end

    private

    def mount_routes
      @server.mount_proc("/api/review/source-sets") do |request, response|
        require_method!(request, "GET")
        respond_json(response, {
          "source_sets" => @workspace.source_sets,
          "session_token" => @workspace.token,
        })
      rescue StandardError => e
        respond_error(response, e)
      end

      @server.mount_proc("/api/review/source-set") do |request, response|
        require_method!(request, "GET")
        respond_json(response, @workspace.source_snapshot(request.query["id"]))
      rescue StandardError => e
        respond_error(response, e)
      end

      @server.mount_proc("/api/review/preview") do |request, response|
        require_method!(request, "POST")
        require_token!(request)
        payload = parse_json(request)
        respond_json(response, @workspace.preview(payload.fetch("plan")))
      rescue StandardError => e
        respond_error(response, e)
      end

      @server.mount_proc("/api/review/apply") do |request, response|
        require_method!(request, "POST")
        require_token!(request)
        payload = parse_json(request)
        respond_json(response, @workspace.apply_transaction(payload.fetch("transaction_id")))
      rescue StandardError => e
        respond_error(response, e)
      end
    end

    def require_method!(request, expected)
      return if request.request_method == expected

      raise Error.new("method_not_allowed", "expected #{expected}", status: 405)
    end

    def require_token!(request)
      supplied = request.header["x-architecture-review-token"]&.first
      return if supplied && secure_compare(supplied, @workspace.token)

      raise Error.new("invalid_session", "review session token is missing or invalid", status: 403)
    end

    def secure_compare(left, right)
      return false unless left.bytesize == right.bytesize

      left.bytes.zip(right.bytes).reduce(0) { |difference, (a, b)| difference | (a ^ b) }.zero?
    end

    def parse_json(request)
      body = String(request.body)
      if body.bytesize > Workspace::MAX_REQUEST_BYTES
        raise Error.new("request_too_large", "request exceeds the review workspace limit", status: 413)
      end
      JSON.parse(body)
    rescue JSON::ParserError => e
      raise Error.new("invalid_json", e.message)
    end

    def respond_json(response, payload, status: 200)
      response.status = status
      JSON_HEADERS.each { |key, value| response[key] = value }
      response.body = JSON.generate(payload)
    end

    def respond_error(response, error)
      if error.is_a?(ArchitectureEdit::Error)
        status = error.code == "stale_edit_plan" ? 409 : 422
        payload = { "error" => { "code" => error.code, "message" => error.message, "details" => error.details } }
      elsif error.is_a?(Error)
        status = error.status
        payload = { "error" => { "code" => error.code, "message" => error.message } }
      elsif error.is_a?(KeyError)
        status = 400
        payload = { "error" => { "code" => "missing_field", "message" => error.message } }
      else
        status = 500
        payload = { "error" => { "code" => "internal_error", "message" => error.message } }
      end
      respond_json(response, payload, status: status)
    end
  end
end
