# frozen_string_literal: true

require "json"
require "minitest/autorun"
require "net/http"
require "socket"
require "tempfile"
require "timeout"
require "uri"

class RendererSemanticPseudocodeBrowserTest < Minitest::Test
  ROOT = File.expand_path("..", __dir__)
  LOOPBACK = "127.0.0.1"

  class BrowserInfrastructureError < StandardError; end
  class WebDriverError < StandardError; end

  # A deliberately small static server keeps this acceptance test dependency
  # free and makes every browser request stay on loopback.
  class StaticServer
    MIME_TYPES = {
      ".css" => "text/css; charset=utf-8",
      ".html" => "text/html; charset=utf-8",
      ".js" => "text/javascript; charset=utf-8",
      ".json" => "application/json; charset=utf-8",
      ".md" => "text/markdown; charset=utf-8",
      ".mjs" => "text/javascript; charset=utf-8",
      ".png" => "image/png",
      ".svg" => "image/svg+xml",
      ".yaml" => "text/yaml; charset=utf-8",
      ".yml" => "text/yaml; charset=utf-8",
    }.freeze

    attr_reader :port

    def initialize(root)
      @root = File.expand_path(root)
      @workers = []
    end

    def start
      @socket = TCPServer.new(LOOPBACK, 0)
      @port = @socket.local_address.ip_port
      @thread = Thread.new do
        loop do
          client = @socket.accept
          @workers << Thread.new(client) { |connection| serve(connection) }
        rescue IOError, Errno::EBADF
          break
        end
      end
      self
    end

    def stop
      @socket&.close
      @thread&.join(2)
      @workers.each { |worker| worker.join(2) }
    rescue IOError, Errno::EBADF
      nil
    end

    private

    def serve(client)
      request_line = client.gets
      return unless request_line

      method, target, = request_line.split(" ", 3)
      loop do
        line = client.gets
        break if line.nil? || line == "\r\n"
      end
      unless %w[GET HEAD].include?(method)
        return respond(client, 405, "Method Not Allowed", "text/plain; charset=utf-8", method == "HEAD")
      end

      path = URI::DEFAULT_PARSER.unescape(target.to_s.split("?", 2).first)
      candidate = File.expand_path(".#{path}", @root)
      candidate = File.join(candidate, "index.html") if path.end_with?("/")
      allowed = candidate.start_with?("#{@root}#{File::SEPARATOR}")
      unless allowed && File.file?(candidate)
        return respond(client, 404, "Not Found", "text/plain; charset=utf-8", method == "HEAD")
      end

      body = File.binread(candidate)
      content_type = MIME_TYPES.fetch(File.extname(candidate), "application/octet-stream")
      respond(client, 200, body, content_type, method == "HEAD")
    rescue StandardError => error
      respond(client, 500, error.message, "text/plain; charset=utf-8", false)
    ensure
      client.close
    end

    def respond(client, status, body, content_type, head)
      reason = { 200 => "OK", 404 => "Not Found", 405 => "Method Not Allowed", 500 => "Internal Server Error" }.fetch(status)
      payload = body.to_s.b
      client.write("HTTP/1.1 #{status} #{reason}\r\n")
      client.write("Content-Type: #{content_type}\r\n")
      client.write("Content-Length: #{payload.bytesize}\r\n")
      client.write("Cache-Control: no-store\r\n")
      client.write("Connection: close\r\n\r\n")
      client.write(payload) unless head
    end
  end

  class Geckodriver
    attr_reader :port

    def initialize(binary)
      @binary = binary
    end

    def start
      @port = available_port
      @log = Tempfile.new(["semantic-pseudocode-geckodriver", ".log"])
      @pid = Process.spawn(
        @binary,
        "--host", LOOPBACK,
        "--port", @port.to_s,
        out: @log.path,
        err: @log.path,
      )
      wait_until_ready
      self
    rescue SystemCallError => error
      raise BrowserInfrastructureError, "could not start #{@binary}: #{error.message}"
    end

    def stop
      return unless @pid

      Process.kill("TERM", @pid)
      Timeout.timeout(5) { Process.wait(@pid) }
    rescue Errno::ESRCH, Errno::ECHILD
      nil
    rescue Timeout::Error
      Process.kill("KILL", @pid)
      Process.wait(@pid)
    ensure
      @pid = nil
      @log&.close!
    end

    def log_tail
      return "" unless @log

      @log.flush
      File.binread(@log.path).lines.last(80).join
    rescue Errno::ENOENT
      ""
    end

    private

    def available_port
      probe = TCPServer.new(LOOPBACK, 0)
      probe.local_address.ip_port
    ensure
      probe&.close
    end

    def wait_until_ready
      deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + 10
      loop do
        begin
          response = Net::HTTP.new(LOOPBACK, @port, nil).get("/status")
          return if response.is_a?(Net::HTTPSuccess)
        rescue Errno::ECONNREFUSED, Errno::ECONNRESET, EOFError
          # The process has not opened its loopback listener yet.
        end
        begin
          Process.kill(0, @pid)
        rescue Errno::ESRCH
          raise BrowserInfrastructureError, "geckodriver exited before becoming ready:\n#{log_tail}"
        end
        if Process.clock_gettime(Process::CLOCK_MONOTONIC) >= deadline
          raise BrowserInfrastructureError, "geckodriver did not become ready:\n#{log_tail}"
        end
        sleep 0.05
      end
    end
  end

  class WebDriver
    def initialize(port, firefox_binary: nil)
      @port = port
      @firefox_binary = firefox_binary
    end

    def start
      options = {
        "args" => ["-headless"],
        "prefs" => {
          "browser.shell.checkDefaultBrowser" => false,
          "browser.startup.homepage_override.mstone" => "ignore",
        },
      }
      options["binary"] = @firefox_binary if @firefox_binary
      value = request("POST", "/session", {
        "capabilities" => {
          "alwaysMatch" => {
            "browserName" => "firefox",
            "pageLoadStrategy" => "eager",
            "moz:firefoxOptions" => options,
          },
        },
      })
      @session_id = value.fetch("sessionId")
      self
    end

    def stop
      request("DELETE", session_path) if @session_id
    rescue WebDriverError, IOError, SystemCallError
      nil
    ensure
      @session_id = nil
    end

    def navigate(url)
      request("POST", "#{session_path}/url", { "url" => url })
    end

    def refresh
      request("POST", "#{session_path}/refresh", {})
    end

    def current_url
      request("GET", "#{session_path}/url")
    end

    def set_window(width:, height:)
      request("POST", "#{session_path}/window/rect", {
        "x" => 0,
        "y" => 0,
        "width" => width,
        "height" => height,
      })
    end

    def execute(script, *args)
      request("POST", "#{session_path}/execute/sync", {
        "script" => script,
        "args" => args,
      })
    end

    private

    def session_path
      "/session/#{URI.encode_www_form_component(@session_id.to_s)}"
    end

    def request(method, path, payload = nil)
      request_class = {
        "DELETE" => Net::HTTP::Delete,
        "GET" => Net::HTTP::Get,
        "POST" => Net::HTTP::Post,
      }.fetch(method)
      http = Net::HTTP.new(LOOPBACK, @port, nil)
      http.open_timeout = 5
      http.read_timeout = 30
      request = request_class.new(path)
      if payload
        request["Content-Type"] = "application/json"
        request.body = JSON.generate(payload)
      end
      response = http.request(request)
      document = response.body.to_s.empty? ? {} : JSON.parse(response.body)
      value = document["value"]
      if !response.is_a?(Net::HTTPSuccess) || (value.is_a?(Hash) && value["error"])
        detail = value.is_a?(Hash) ? value["message"] || value["error"] : response.body
        raise WebDriverError, "WebDriver #{method} #{path} failed (#{response.code}): #{detail}"
      end
      value
    rescue JSON::ParserError => error
      raise WebDriverError, "WebDriver #{method} #{path} returned invalid JSON: #{error.message}"
    rescue SystemCallError, Timeout::Error => error
      raise WebDriverError, "WebDriver #{method} #{path} failed: #{error.message}"
    end
  end

  def test_semantic_pseudocode_and_board_are_synchronized_in_firefox
    skip "set RUN_BROWSER_ACCEPTANCE=1 to run the Firefox/WebDriver acceptance test" unless browser_acceptance?

    geckodriver_path = configured_executable("GECKODRIVER", "geckodriver", "/snap/bin/geckodriver")
    firefox_path = configured_executable("FIREFOX_BIN", "firefox", "/usr/bin/firefox", "/snap/bin/firefox")
    skip "geckodriver is unavailable; set GECKODRIVER=/path/to/geckodriver" unless geckodriver_path
    skip "Firefox is unavailable; set FIREFOX_BIN=/path/to/firefox" unless firefox_path

    server = StaticServer.new(static_site_root).start
    driver_process = Geckodriver.new(geckodriver_path)
    browser = nil
    begin
      driver_process.start
      browser = WebDriver.new(driver_process.port, firefox_binary: firefox_path).start
      run_semantic_pseudocode_acceptance(browser, server.port)
    rescue BrowserInfrastructureError, WebDriverError => error
      flunk "#{error.message}\n\ngeckodriver log:\n#{driver_process.log_tail}"
    ensure
      browser&.stop
      driver_process.stop
      server.stop
    end
  end

  private

  def static_site_root
    configured = ENV["STATIC_SITE_ROOT"]
    configured ? File.expand_path(configured, ROOT) : ROOT
  end

  def browser_acceptance?
    ENV["RUN_BROWSER_ACCEPTANCE"] == "1"
  end

  def configured_executable(environment_key, command, *fallbacks)
    configured = ENV[environment_key]
    return File.expand_path(configured) if configured && File.file?(configured) && File.executable?(configured)

    ENV.fetch("PATH", "").split(File::PATH_SEPARATOR).each do |directory|
      candidate = File.join(directory, command)
      return candidate if File.file?(candidate) && File.executable?(candidate)
    end
    fallbacks.find { |candidate| File.file?(candidate) && File.executable?(candidate) }
  end

  def run_semantic_pseudocode_acceptance(browser, server_port)
    base = "http://#{LOOPBACK}:#{server_port}/renderer/architecture/"
    browser.set_window(width: 1440, height: 1000)
    verify_ipa_token_to_graph_and_back(browser, base)
    verify_high_level_call_drilldown(browser, base)
    verify_published_reference_panel(browser, base)
    verify_grouped_inspector_and_stable_status(browser, base)
    verify_math_symbols_and_theme(browser, base)
    verify_touch_pinch_zoom(browser, base)
    verify_mobile_board_trace(browser, base)
  end

  def verify_ipa_token_to_graph_and_back(browser, base)
    browser.navigate("#{base}?arch=genie3&board=genie3_ipa_internals")
    wait_for(browser, "the IPA detail board") do
      browser.execute(<<~JS)
        return document.readyState !== "loading"
          && Boolean(document.querySelector('[data-node-id="attention_weights"]'));
      JS
    end
    token_result = wait_for(browser, "the softmax attention token") do
      result = browser.execute(<<~JS)
        const line = [...document.querySelectorAll('.semantic-trace-line')]
          .find((item) => item.textContent.includes('attention = softmax'));
        const token = line && [...line.querySelectorAll('.semantic-token')]
          .find((item) => item.textContent.trim() === 'attention');
        if (!token) return null;
        token.focus();
        return {
          active: document.activeElement === token,
          focusedNode: document.querySelector('[data-node-id="attention_weights"]')
            ?.classList.contains('is-connectivity-focus') || false,
          incoming: document.querySelectorAll('.is-connectivity-input').length,
          outgoing: document.querySelectorAll('.is-connectivity-output').length,
          breakOpportunities: line.querySelectorAll('wbr').length,
          overflowWrap: getComputedStyle(line.querySelector('.semantic-trace-code')).overflowWrap,
          focusedOpacity: Number(getComputedStyle(
            document.querySelector('[data-node-id="attention_weights"]'),
          ).opacity),
          unrelatedOpacity: Number(getComputedStyle(
            document.querySelector('[data-node-id="project_scalar_terms"]'),
          ).opacity),
        };
      JS
      result if result && result["focusedNode"] && result["unrelatedOpacity"] <= 0.25
    end
    assert token_result["active"], "the semantic variable should receive keyboard focus"
    assert_operator token_result["incoming"], :>, 0, "the producer edge should highlight"
    assert_operator token_result["outgoing"], :>, 0, "the consumer edges should highlight"
    assert_operator token_result["breakOpportunities"], :>, 0,
      "long code should expose syntax-safe break opportunities"
    assert_equal "normal", token_result["overflowWrap"],
      "the renderer must not split pseudocode at arbitrary characters"
    assert_operator token_result["focusedOpacity"], :>, token_result["unrelatedOpacity"]
    assert_operator token_result["unrelatedOpacity"], :<=, 0.25,
      "unrelated components should fade during semantic focus"

    graph_result = browser.execute(<<~JS)
      document.activeElement?.blur();
      const node = document.querySelector('[data-node-id="attention_weights"]');
      node.focus();
      return {
        active: document.activeElement === node,
        matchingTokens: [...document.querySelectorAll('.semantic-token.is-trace-transient')]
          .filter((item) => item.textContent.trim() === 'attention').length,
        unrelatedStillMuted: document.querySelector('[data-node-id="project_scalar_terms"]')
          ?.classList.contains('is-connectivity-muted') || false,
      };
    JS
    assert graph_result["active"], "the graph representation should receive keyboard focus"
    assert_operator graph_result["matchingTokens"], :>, 0,
      "focusing the graph value should highlight its pseudocode occurrences"
    refute graph_result["unrelatedStillMuted"],
      "the semantic spotlight should clear when focus returns to the board"

    clicked_url = browser.execute(<<~JS)
      const line = [...document.querySelectorAll('.semantic-trace-line')]
        .find((item) => item.textContent.includes('attention = softmax'));
      const token = [...line.querySelectorAll('.semantic-token')]
        .find((item) => item.textContent.trim() === 'attention');
      token.click();
      return window.location.href;
    JS
    params = URI.decode_www_form(URI(clicked_url).query.to_s).to_h
    assert_equal "genie3_ipa_internals", params["board"]
    assert_equal "attention_weights", params["node"]

    browser.refresh
    restored = wait_for(browser, "the shared IPA node selection after reload") do
      browser.execute(<<~JS)
        return document.querySelector('[data-node-id="attention_weights"]')
          ?.classList.contains('is-focused') || false;
      JS
    end
    assert restored
  end

  def verify_high_level_call_drilldown(browser, base)
    browser.navigate("#{base}?arch=genie3")
    wait_for(browser, "the Genie 3 overview") do
      browser.execute("return Boolean(document.querySelector('[data-node-id=\"diffusion_sampler\"]'));")
    end
    overview_spacing = wait_for(browser, "the compact feature-builder boundary") do
      browser.execute(<<~JS)
        const builder = document.querySelector('[data-node-id="feature_builder"]');
        const features = document.querySelector('[data-node-id="feature_bundle"]');
        const sampler = document.querySelector('[data-node-id="diffusion_sampler"]');
        if (!builder || !features || !sampler) return null;
        return {
          gap: features.offsetLeft - (builder.offsetLeft + builder.offsetWidth),
          rightGap: sampler.offsetLeft - (features.offsetLeft + features.offsetWidth),
          labels: [...document.querySelectorAll('.arch-edge-label')]
            .map((item) => item.dataset.label || item.textContent),
        };
      JS
    end
    assert_operator overview_spacing["gap"], :<=, 70,
      "inspector-only prose should not stretch the feature-builder boundary"
    assert_operator overview_spacing["rightGap"], :<=, 70,
      "a sampler schedule label should not stretch the feature-bundle handoff"
    refute_includes overview_spacing["labels"], "partial atomization"
    formatting = browser.execute(<<~JS)
      const line = [...document.querySelectorAll('.semantic-trace-line')]
        .find((item) => item.textContent.includes('features = tokenize(request)'));
      const expression = line?.querySelector('.semantic-code-expression');
      const comment = line?.querySelector('.semantic-code-comment');
      const label = line?.querySelector('.semantic-trace-label > span');
      return {
        expression: expression?.textContent || '',
        comment: comment?.textContent.replace(/^#\s*/, '') || '',
        commentWords: comment?.querySelectorAll('.semantic-code-comment-word').length || 0,
        label: label?.textContent || '',
      };
    JS
    assert_equal "features = tokenize(request)", formatting["expression"]
    assert_equal "C-alpha per unknown residue; atom14 heavy atoms only for known atomized residues.",
      formatting["comment"]
    assert_operator formatting["commentWords"], :>, 1,
      "comment words should wrap only between complete words"
    assert_equal "Task dependent partial atomization", formatting["label"]

    feature_table = wait_for(browser, "the feature bundle field table") do
      browser.execute(<<~JS)
        const featureNode = document.querySelector('[data-node-id="feature_bundle"]');
        if (!featureNode) return null;
        if (!featureNode.classList.contains('is-focused')) {
          featureNode.click();
          return null;
        }
        const table = document.querySelector('.representation-field-table');
        if (!table) return null;
        return {
          badge: featureNode.dataset.fieldCount || '',
          dictionaryGlyph: featureNode.classList.contains('tensor-dictionary'),
          hasTensorDimensions: Boolean(featureNode.querySelector('.tensor-dims')),
          preview: featureNode.querySelector('.dictionary-glyph')?.textContent || '',
          meaning: featureNode.querySelector('.tensor-meaning')?.textContent || '',
          rows: table.querySelectorAll('tbody tr').length,
          keys: [...table.querySelectorAll('.representation-field-names code')]
            .map((item) => item.textContent),
          axes: [...table.querySelectorAll('.representation-field-shape i')]
            .map((item) => item.textContent),
          text: table.textContent.replace(/\s+/g, ' ').trim(),
        };
      JS
    end
    assert_equal "25", feature_table["badge"]
    assert feature_table["dictionaryGlyph"]
    refute feature_table["hasTensorDimensions"],
      "a heterogeneous dictionary must not display one tensor shape"
    assert_includes feature_table["preview"], "token_mask: tensor"
    assert_equal "feature dictionary", feature_table["meaning"]
    assert_equal 6, feature_table["rows"]
    assert_includes feature_table["keys"], "token_mask"
    assert_includes feature_table["keys"], "gt_atom_positions"
    assert_includes feature_table["keys"], "cond_interface_mask"
    assert_includes feature_table["keys"], "plddt"
    assert_includes feature_table["axes"], "token"
    assert_includes feature_table["axes"], "atom"
    assert_includes feature_table["text"], "Disabled for unconditional generation"

    opened = browser.execute(<<~JS)
      const line = [...document.querySelectorAll('.semantic-trace-line')]
        .find((item) => item.textContent.includes('DiffusionSampler(features)'));
      const drill = line?.querySelector('.semantic-trace-drill');
      if (!drill) return false;
      drill.click();
      return true;
    JS
    assert opened, "the high-level sampler call should expose a drilldown action"

    drilldown = wait_for(browser, "the sampler child board") do
      browser.execute(<<~JS)
        const params = new URLSearchParams(window.location.search);
        return params.get('board') === 'sampling_loop' && {
          hasReverseStep: Boolean(document.querySelector('[data-node-id="reverse_diffusion_step"]')),
          heading: document.querySelector('.semantic-trace-heading strong')?.textContent || '',
          subtitle: document.querySelector('.semantic-trace-heading span')?.textContent || '',
        };
      JS
    end
    assert drilldown["hasReverseStep"]
    assert_equal "Directional DDIM sampling", drilldown["heading"]
    assert_includes drilldown["subtitle"], "repeat ×100"

    cached_dictionary = browser.execute(<<~JS)
      const node = document.querySelector('[data-node-id="feature_bundle"]');
      return {
        dictionaryGlyph: node?.classList.contains('tensor-dictionary') || false,
        pairGlyph: node?.classList.contains('tensor-pair') || false,
        meaning: node?.querySelector('.tensor-meaning')?.textContent || '',
        symbol: node?.querySelector('.tensor-symbol')?.textContent || '',
      };
    JS
    assert cached_dictionary["dictionaryGlyph"]
    refute cached_dictionary["pairGlyph"]
    assert_equal "cached feature dictionary", cached_dictionary["meaning"]
    assert_equal "features", cached_dictionary["symbol"]
  end

  def verify_published_reference_panel(browser, base)
    browser.navigate("#{base}?arch=genie3&board=motif_task_featurization")
    panel = wait_for(browser, "the cited Genie 3 partial-atomization figure") do
      browser.execute(<<~JS)
        const layer = document.querySelector('#referencePanelLayer');
        const figure = layer?.querySelector('[data-reference-panel-id="authors_partial_atomization"]');
        const image = figure?.querySelector('img');
        const canvas = document.querySelector('#architectureCanvas');
        const modules = document.querySelector('#moduleLayer');
        const zoom = document.querySelector('.canvas-zoom-value')?.textContent || '';
        if (!figure || !image?.complete || image.naturalWidth <= 0 || zoom === '100%') return null;
        const layerRect = layer.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const nodeRects = [...modules.querySelectorAll('[data-node-id]')]
          .map((node) => node.getBoundingClientRect());
        return {
          panelCount: layer.querySelectorAll('.reference-panel').length,
          imageWidth: image.naturalWidth,
          imageHeight: image.naturalHeight,
          alt: image.alt,
          sourceLinked: Boolean(figure.querySelector('.reference-panel-citation[href]')),
          license: figure.querySelector('.reference-panel-license')?.textContent || '',
          position: getComputedStyle(layer).position,
          transform: getComputedStyle(layer).transform,
          canvasHasRail: canvas.classList.contains('has-reference-panels'),
          separatedFromGraph: Math.max(...nodeRects.map((rect) => rect.right)) <= layerRect.left + 1,
          graphInsideCanvas: Math.min(...nodeRects.map((rect) => rect.left)) >= canvasRect.left - 1,
        };
      JS
    end

    assert_equal 1, panel["panelCount"]
    assert_operator panel["imageWidth"], :>, 0
    assert_operator panel["imageHeight"], :>, 0
    assert_includes panel["alt"], "Partial Atomization"
    assert panel["sourceLinked"]
    assert_includes panel["license"], "CC BY 4.0"
    assert_equal "absolute", panel["position"]
    assert_equal "none", panel["transform"]
    assert panel["canvasHasRail"]
    assert panel["separatedFromGraph"], "the cited figure should not cover the architecture grid"
    assert panel["graphInsideCanvas"], "fitting the cited board should keep every node inside the canvas"

    viewer = wait_for(browser, "the opened reference-figure viewer") do
      browser.execute(<<~JS)
        const dialog = document.querySelector('#referenceFigureDialog');
        if (!dialog.open) {
          document.querySelector('.reference-panel-image-button')?.click();
          return null;
        }
        const image = document.querySelector('#referenceFigureImage');
        if (!image.complete || image.naturalWidth <= 0) return null;
        return {
          title: document.querySelector('#referenceFigureTitle')?.textContent || '',
          alt: image.alt,
          width: image.getBoundingClientRect().width,
          zoom: document.querySelector('#referenceFigureZoomValue')?.textContent || '',
          citation: Boolean(document.querySelector('#referenceFigureCitation[href]')),
        };
      JS
    end
    assert_equal "Authors' partial-atomization diagram", viewer["title"]
    assert_includes viewer["alt"], "Partial Atomization"
    assert_equal "100%", viewer["zoom"]
    assert viewer["citation"]

    zoomed = wait_for(browser, "the enlarged reference figure") do
      browser.execute(<<~JS)
        const zoomIn = document.querySelector('[data-reference-zoom="in"]');
        if (document.querySelector('#referenceFigureZoomValue')?.textContent === '100%') {
          zoomIn.click();
          zoomIn.click();
          return null;
        }
        const image = document.querySelector('#referenceFigureImage');
        return {
          width: image.getBoundingClientRect().width,
          zoom: document.querySelector('#referenceFigureZoomValue')?.textContent || '',
          zoomedClass: document.querySelector('#referenceFigureViewport')?.classList.contains('is-zoomed'),
        };
      JS
    end
    assert_operator zoomed["width"], :>, viewer["width"]
    refute_equal "100%", zoomed["zoom"]
    assert zoomed["zoomedClass"]

    closed = browser.execute(<<~JS)
      document.querySelector('#referenceFigureClose').click();
      return !document.querySelector('#referenceFigureDialog').open;
    JS
    assert closed
  end

  def verify_mobile_board_trace(browser, base)
    browser.set_window(width: 640, height: 900)
    browser.navigate("#{base}?arch=genie3")
    mobile = wait_for(browser, "the mobile overview pseudocode entry point") do
      browser.execute(<<~JS)
        const pages = document.querySelector('.focus-panel-pages');
        const details = document.querySelector('.focus-detail-section');
        const trace = document.querySelector('.focus-trace-section');
        const body = document.querySelector('#semanticTraceBody');
        if (!pages || !details || !trace || !body || !document.querySelector('[data-node-id="diffusion_sampler"]')) return null;
        return {
          innerWidth: window.innerWidth,
          selectedNode: document.querySelector('.focus-panel')?.classList.contains('is-selected') || false,
          combined: pages.contains(details) && pages.contains(trace)
            && Boolean(details.compareDocumentPosition(trace) & Node.DOCUMENT_POSITION_FOLLOWING),
          hasTabs: Boolean(document.querySelector('[role="tablist"]')),
          lines: body.querySelectorAll('.semantic-trace-line').length,
          hasSampler: body.textContent.includes('DiffusionSampler(features)'),
        };
      JS
    end
    assert_operator mobile["innerWidth"], :<=, 680
    refute mobile["selectedNode"], "the test must exercise the unselected board overview"
    assert mobile["combined"], "mobile details and pseudocode should share one scroll"
    refute mobile["hasTabs"]
    assert_operator mobile["lines"], :>=, 3
    assert mobile["hasSampler"]
  end

  def verify_grouped_inspector_and_stable_status(browser, base)
    browser.set_window(width: 1440, height: 1000)
    browser.navigate("#{base}?arch=genie3&board=reverse_diffusion_step")
    wait_for(browser, "the reverse diffusion step") do
      browser.execute(<<~JS)
        return Boolean(document.querySelector('[data-node-id="denoiser"]'));
      JS
    end
    layout = wait_for(browser, "the continuous details and pseudocode inspector") do
      browser.execute(<<~JS)
        const panel = document.querySelector('.focus-panel');
        const pages = document.querySelector('.focus-panel-pages');
        const details = document.querySelector('.focus-detail-section');
        const trace = document.querySelector('.focus-trace-section');
        const body = document.querySelector('#semanticTraceBody');
        const scroll = body?.querySelector('.semantic-trace-scroll');
        const status = body?.querySelector('.semantic-trace-status');
        const target = body?.querySelector('.is-semantic-unavailable[data-semantic-interaction]');
        const line = target?.closest('.semantic-trace-line');
        if (!panel || !pages || !details || !trace || !body || !scroll || !status || !target || !line) return null;

        const beforeTop = line.getBoundingClientRect().top;
        target.dispatchEvent(new PointerEvent('pointerenter'));
        const afterTop = line.getBoundingClientRect().top;
        const result = {
          panelWidth: panel.getBoundingClientRect().width,
          traceLines: [...body.querySelectorAll('.semantic-trace-code')]
            .map((code) => code.textContent.replace(/\s+/g, ' ').trim()),
          combined: pages.contains(details) && pages.contains(trace)
            && Boolean(details.compareDocumentPosition(trace) & Node.DOCUMENT_POSITION_FOLLOWING),
          hasTabs: Boolean(document.querySelector('[role="tablist"]')),
          inspectorOverflow: pages.scrollWidth - pages.clientWidth,
          statusBelowTrace: status.getBoundingClientRect().top >= scroll.getBoundingClientRect().bottom,
          statusText: status.textContent,
          lineShift: Math.abs(afterTop - beforeTop),
        };
        target.dispatchEvent(new PointerEvent('pointerleave'));
        return result;
      JS
    end

    assert_operator layout["panelWidth"], :>=, 339,
      "the desktop inspector should leave room for readable pseudocode"
    assert layout["traceLines"].any? { |line| line.include?("DirectionalDDIMMath") },
      "the reverse-step board should show the collapsed sampler call"
    refute layout["traceLines"].any? { |line| line.include?("DDIMUpdate") || line.include?("epsilon_theta =") },
      "sampler internals should appear only on the sampler-math detail board"
    assert layout["combined"], "Details should flow directly into Pseudocode"
    refute layout["hasTabs"]
    assert_operator layout["inspectorOverflow"], :<=, 1,
      "the continuous inspector should not overflow horizontally"
    assert layout["statusBelowTrace"], "transient trace guidance should live below the code"
    assert_includes layout["statusText"], "not visible at the current board level"
    assert_operator layout["lineShift"], :<=, 0.5,
      "hover guidance must not move the line under the pointer"
  end

  def verify_math_symbols_and_theme(browser, base)
    browser.navigate("#{base}?arch=genie3&board=denoiser_forward")
    wait_for(browser, "the denoiser trace") do
      browser.execute(<<~JS)
        return Boolean(document.querySelector('[data-node-id="refined_single_features"]'));
      JS
    end
    symbol = wait_for(browser, "the refined-single MathJax symbol") do
      browser.execute(<<~JS)
        const token = document.querySelector('.semantic-token[aria-label="read: s_5"]');
        const math = token?.querySelector('.semantic-token-math');
        const fallback = math?.querySelector('.semantic-token-math-fallback');
        const source = math?.querySelector('.semantic-token-math-source');
        if (!token || !math) return null;
        token.focus();
        return {
          accessibleName: token.getAttribute('aria-label'),
          hasMathJax: Boolean(math.querySelector('mjx-container')),
          hasTeXSource: math.textContent.includes('s_5'),
          fallbackVisible: (fallback?.getBoundingClientRect().width || 0) > 0,
          rawSourceHidden: Boolean(math.querySelector('mjx-container'))
            || (source?.getBoundingClientRect().width || 0) <= 1,
          graphFocused: document.querySelector('[data-node-id="refined_single_features"]')
            ?.classList.contains('is-connectivity-focus') || false,
        };
      JS
    end
    assert_equal "read: s_5", symbol["accessibleName"]
    assert symbol["hasMathJax"] || symbol["hasTeXSource"],
      "the canonical TeX should be present before or after MathJax startup"
    assert symbol["hasMathJax"] || symbol["fallbackVisible"],
      "a readable mathematical fallback should appear while MathJax starts"
    assert symbol["rawSourceHidden"], "raw TeX delimiters should never be visible"
    assert symbol["graphFocused"], "typeset variables must keep their semantic graph binding"

    selected = browser.execute(<<~JS)
      const switcher = document.querySelector('#rendererThemeSwitcher');
      switcher.value = 'ramith';
      switcher.dispatchEvent(new Event('change', { bubbles: true }));
      const style = getComputedStyle(document.documentElement);
      return {
        theme: document.documentElement.dataset.theme,
        selected: switcher.value,
        stored: localStorage.getItem('explainer.theme'),
        background: style.getPropertyValue('--bg').trim(),
        accent: style.getPropertyValue('--accent').trim(),
      };
    JS
    assert_equal "ramith", selected["theme"]
    assert_equal "ramith", selected["selected"]
    assert_equal "ramith", selected["stored"]
    assert_includes ["#fffff8", "#151515"], selected["background"]
    assert_includes ["#2e7247", "#66bb6a"], selected["accent"]

    browser.refresh
    restored = wait_for(browser, "the persisted Ramith paper theme") do
      browser.execute(<<~JS)
        const switcher = document.querySelector('#rendererThemeSwitcher');
        return document.documentElement.dataset.theme === 'ramith' && switcher?.value === 'ramith';
      JS
    end
    assert restored
    browser.execute(<<~JS)
      const switcher = document.querySelector('#rendererThemeSwitcher');
      switcher.value = 'atlas';
      switcher.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    JS
  end

  def verify_touch_pinch_zoom(browser, base)
    browser.set_window(width: 1440, height: 1000)
    browser.navigate("#{base}?arch=genie3")
    initial = wait_for(browser, "the touchscreen pinch gesture target") do
      browser.execute(<<~JS)
        const canvas = document.querySelector('#architectureCanvas');
        const node = document.querySelector('[data-node-id="diffusion_sampler"]');
        const label = document.querySelector('#canvasControls .canvas-zoom-value');
        if (!canvas || !node || !label) return null;
        const rect = node.getBoundingClientRect();
        const y = rect.top + rect.height / 2;
        const firstX = rect.left + rect.width * 0.35;
        const secondX = rect.left + rect.width * 0.65;
        const dispatch = (target, type, pointerId, clientX) => target.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            pointerId,
            pointerType: 'touch',
            isPrimary: pointerId === 41,
            button: 0,
            buttons: type === 'pointerup' ? 0 : 1,
            clientX,
            clientY: y,
          }),
        );
        const before = Number.parseInt(label.textContent, 10);
        dispatch(node, 'pointerdown', 41, firstX);
        dispatch(node, 'pointerdown', 42, secondX);
        dispatch(canvas, 'pointermove', 42, secondX + 80);
        dispatch(canvas, 'pointerup', 41, firstX);
        dispatch(canvas, 'pointerup', 42, secondX + 80);
        node.click();
        return { before };
      JS
    end
    result = wait_for(browser, "the touchscreen pinch zoom update") do
      browser.execute(<<~JS)
        const canvas = document.querySelector('#architectureCanvas');
        const label = document.querySelector('#canvasControls .canvas-zoom-value');
        const after = Number.parseInt(label?.textContent || '', 10);
        if (!(after > #{Integer(initial["before"])})) return null;
        return {
          after,
          panning: canvas.classList.contains('is-panning'),
          selected: new URLSearchParams(window.location.search).has('node'),
        };
      JS
    end
    assert_operator result["after"], :>, initial["before"],
      "spreading two touches should zoom the main architecture board in"
    refute result["panning"], "lifting both touches should end the gesture"
    refute result["selected"], "a pinch beginning on a node must not activate it"
  end

  def wait_for(browser, description, timeout: 15)
    deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + timeout
    last_error = nil
    loop do
      begin
        value = yield
        return value if value
      rescue WebDriverError => error
        last_error = error
      end
      break if Process.clock_gettime(Process::CLOCK_MONOTONIC) >= deadline

      sleep 0.05
    end
    flunk "timed out waiting for #{description}#{last_error ? ": #{last_error.message}" : ""}"
  end
end
