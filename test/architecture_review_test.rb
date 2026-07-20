# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/architecture_review"

class ArchitectureReviewTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)

  FakeResult = Struct.new(:payload, :report) do
    def to_h = payload
    def to_text = report
  end

  class FakeCompiler
    attr_reader :applied, :apply_calls, :apply_validated_calls, :prepare_and_preview_calls

    def initialize
      @apply_calls = 0
      @apply_validated_calls = 0
      @prepare_and_preview_calls = 0
    end

    def prepare_and_preview(plan)
      @prepare_and_preview_calls += 1
      prepared = bind_digests(plan)
      [prepared, FakeResult.new({ "status" => "validated", "plan_id" => plan.fetch("id") }, "validated diff")]
    end

    def prepare_plan(plan)
      bind_digests(plan)
    end

    def preview(plan, require_digests:)
      raise "digests were not required" unless require_digests

      FakeResult.new({ "status" => "validated", "plan_id" => plan.fetch("id") }, "validated diff")
    end

    def apply(plan)
      @apply_calls += 1
      @applied = plan
      FakeResult.new({ "status" => "applied", "plan_id" => plan.fetch("id") }, "applied diff")
    end

    def apply_validated(plan, result)
      @apply_validated_calls += 1
      @applied = plan
      FakeResult.new(result.payload.merge("status" => "applied"), "applied validated diff")
    end

    private

    def bind_digests(plan)
      Marshal.load(Marshal.dump(plan)).tap do |prepared|
        prepared.fetch("target")["architecture_sha256"] = "a" * 64
        prepared.fetch("target")["view_sha256"] = "b" * 64
      end
    end
  end

  def test_lists_registry_source_sets_and_returns_canonical_snapshot
    workspace = ArchitectureReview::Workspace.new(root: ROOT, token: "fixed-token")

    assert_equal "fixed-token", workspace.token
    assert_includes workspace.source_sets.map { |item| item.fetch("id") }, "genie3"
    snapshot = workspace.source_snapshot("genie3")
    assert_equal "genie3", snapshot.dig("source_set", "id")
    assert_equal "architecture-v0.5", snapshot.dig("architecture", "schema_version")
    assert_equal "visualization-v0.4", snapshot.dig("view", "schema_version")
  end

  def test_rejects_non_registry_and_path_like_source_set_ids
    workspace = ArchitectureReview::Workspace.new(root: ROOT)

    error = assert_raises(ArchitectureReview::Error) { workspace.source_snapshot("../genie3") }
    assert_equal "invalid_source_set", error.code
    error = assert_raises(ArchitectureReview::Error) { workspace.source_snapshot("missing") }
    assert_equal "unknown_source_set", error.code
    assert_equal 404, error.status
  end

  def test_preview_is_single_pass_and_transaction_apply_uses_the_exact_validated_result
    compiler = FakeCompiler.new
    workspace = ArchitectureReview::Workspace.new(root: ROOT, compiler: compiler)
    plan = review_plan

    preview = workspace.preview(plan)
    prepared = preview.fetch("prepared_plan")
    assert_equal "a" * 64, prepared.dig("target", "architecture_sha256")
    assert_equal "validated", preview.dig("preview", "status")
    assert_equal "validated diff", preview.fetch("report")
    assert_match(/\A[a-f0-9]{64}\z/, preview.fetch("transaction_id"))
    assert_equal 1, compiler.prepare_and_preview_calls

    exact_prepared = Marshal.load(Marshal.dump(prepared))
    prepared.fetch("operations").first.fetch("set")["role"] = "Client-substituted role"

    applied = workspace.apply_transaction(preview.fetch("transaction_id"))
    assert_equal exact_prepared, compiler.applied
    assert_equal "applied", applied.dig("result", "status")
    assert_equal 1, compiler.apply_validated_calls
    assert_equal 0, compiler.apply_calls

    error = assert_raises(ArchitectureReview::Error) do
      workspace.apply_transaction(preview.fetch("transaction_id"))
    end
    assert_equal "expired_review_transaction", error.code
    assert_equal 409, error.status
  end

  def test_validated_transaction_expires_and_cache_is_bounded
    now = 10.0
    compiler = FakeCompiler.new
    workspace = ArchitectureReview::Workspace.new(
      root: ROOT,
      compiler: compiler,
      transaction_ttl: 5,
      max_transactions: 1,
      clock: -> { now },
    )

    first_id = workspace.preview(review_plan("review_first")).fetch("transaction_id")
    second_id = workspace.preview(review_plan("review_second")).fetch("transaction_id")
    bounded_error = assert_raises(ArchitectureReview::Error) { workspace.apply_transaction(first_id) }
    assert_equal "expired_review_transaction", bounded_error.code

    now += 6
    expiry_error = assert_raises(ArchitectureReview::Error) { workspace.apply_transaction(second_id) }
    assert_equal "expired_review_transaction", expiry_error.code
    assert_equal 0, compiler.apply_validated_calls
  end

  def test_direct_apply_remains_backward_compatible
    compiler = FakeCompiler.new
    workspace = ArchitectureReview::Workspace.new(root: ROOT, compiler: compiler)
    prepared = compiler.prepare_plan(review_plan)

    result = workspace.apply(prepared)

    assert_equal "applied", result.dig("result", "status")
    assert_equal 1, compiler.apply_calls
    assert_equal 0, compiler.apply_validated_calls
  end

  private

  def review_plan(id = "review_example")
    {
      "schema_version" => "architecture-edit-v0.2",
      "id" => id,
      "target" => { "source_set" => "genie3" },
      "intent" => "Clarify one explanation.",
      "operations" => [
        {
          "op" => "update_entity",
          "ref" => "modules.feature_builder",
          "set" => { "role" => "Clearer role" },
        },
      ],
    }
  end
end
