#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "optparse"
require_relative "../lib/architecture_verifier"

options = {
  format: "text",
  root: File.expand_path("..", __dir__),
}
parser = OptionParser.new do |opts|
  opts.banner = <<~TEXT
    Usage: ruby scripts/verify_architecture.rb --source-set ID [options]

    Read-only verification of one registered architecture source set.
    The final manifest-freshness subcheck is repository-wide.
  TEXT
  opts.on("--source-set ID", "Registered source-set ID") { |value| options[:source_set] = value }
  opts.on("--board ID", "Focus layout/projection diagnostics on one board") { |value| options[:board] = value }
  opts.on("--format FORMAT", %w[text json], "Output format: text or json") { |value| options[:format] = value }
  opts.on("--root PATH", "Explainer repository root") { |value| options[:root] = File.expand_path(value) }
  opts.on("-h", "--help", "Show this help") do
    puts opts
    exit 0
  end
end

begin
  parser.parse!(ARGV)
  raise OptionParser::InvalidArgument, "unexpected arguments: #{ARGV.join(' ')}" unless ARGV.empty?
  raise OptionParser::MissingArgument, "--source-set" unless options[:source_set]
rescue OptionParser::ParseError => e
  warn "#{e.message}\n#{parser}"
  exit 2
end

begin
  report = ArchitectureVerifier::Verifier.new(root: options.fetch(:root)).verify(
    source_set_id: options.fetch(:source_set),
    board_id: options[:board],
    include_manifest: true,
  )
  puts(options.fetch(:format) == "json" ? JSON.pretty_generate(report.to_h) : report.to_text)
  exit(report.status == "passed" ? 0 : 1)
rescue StandardError => e
  if options.fetch(:format) == "json"
    diagnostic = {
      "check" => "verifier",
      "code" => "verifier_error",
      "severity" => "error",
      "message" => e.message,
    }
    puts JSON.pretty_generate(
      "schema_version" => ArchitectureVerifier::SCHEMA_VERSION,
      "status" => "failed",
      "source_set" => options[:source_set],
      "board" => options[:board],
      "checks" => [{
        "id" => "verifier",
        "status" => "failed",
        "diagnostics" => [diagnostic],
      }],
      "summary" => {
        "check_count" => 1,
        "passed_count" => 0,
        "failed_count" => 1,
        "skipped_count" => 0,
        "error_count" => 1,
        "warning_count" => 0,
      },
    )
  else
    warn "architecture verification failed [verifier_error]: #{e.message}"
  end
  exit 1
end
