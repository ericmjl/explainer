#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "optparse"
require "psych"
require_relative "../lib/architecture_edit"

USAGE = <<~TEXT
  Usage:
    ruby scripts/architecture_edit.rb prepare REQUEST.yaml --out PREPARED.yaml
    ruby scripts/architecture_edit.rb show PLAN.yaml [--format text|json]
    ruby scripts/architecture_edit.rb apply PREPARED.yaml [--format text|json]
TEXT

command = ARGV.shift
abort USAGE unless %w[prepare show apply].include?(command)

options = {
  format: "text",
  root: ArchitectureEdit::ROOT,
}
parser = OptionParser.new do |opts|
  opts.banner = USAGE
  opts.on("--out PATH", "Prepared-plan output (required by prepare)") { |value| options[:out] = value }
  opts.on("--format FORMAT", %w[text json], "Report format: text or json") { |value| options[:format] = value }
  opts.on("--root PATH", "Repository root (primarily for isolated tooling/tests)") { |value| options[:root] = value }
  opts.on("-h", "--help", "Show this help") do
    puts opts
    exit 0
  end
end
begin
  parser.parse!(ARGV)
rescue OptionParser::ParseError => e
  abort "#{e.message}\n#{USAGE}"
end
plan_path = ARGV.shift
abort USAGE unless plan_path && ARGV.empty?

compiler = ArchitectureEdit::Compiler.new(root: options.fetch(:root))

begin
  plan = compiler.load_plan(File.expand_path(plan_path))
  case command
  when "prepare"
    output_path = options[:out]
    raise ArchitectureEdit::Error.new("missing_output", "prepare requires --out PREPARED.yaml") unless output_path

    output_path = File.expand_path(output_path)
    if File.exist?(output_path)
      raise ArchitectureEdit::Error.new("output_exists", "refusing to overwrite #{output_path}")
    end
    prepared = compiler.prepare_plan(plan)
    File.open(output_path, File::WRONLY | File::CREAT | File::EXCL, 0o644) do |file|
      file.write(Psych.dump(prepared, line_width: -1))
    end
    puts "Prepared #{prepared.fetch('id')} at #{output_path}"
    puts "Run: ruby scripts/architecture_edit.rb show #{output_path}"
  when "show"
    result = compiler.preview(plan)
    puts(options.fetch(:format) == "json" ? JSON.pretty_generate(result.to_h) : result.to_text)
  when "apply"
    result = compiler.apply(plan)
    puts(options.fetch(:format) == "json" ? JSON.pretty_generate(result.to_h) : result.to_text)
  end
rescue ArchitectureEdit::Error => e
  warn "architecture edit failed [#{e.code}]: #{e.message}"
  Array(e.details).each { |detail| warn "- #{detail}" }
  exit 1
rescue SystemCallError => e
  warn "architecture edit failed [filesystem_error]: #{e.message}"
  exit 1
end
