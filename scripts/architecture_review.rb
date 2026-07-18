#!/usr/bin/env ruby
# frozen_string_literal: true

require "optparse"
require_relative "../lib/architecture_review"

options = { port: 4777, root: ArchitectureEdit::ROOT }
OptionParser.new do |parser|
  parser.banner = "Usage: ruby scripts/architecture_review.rb [--port PORT]"
  parser.on("--port PORT", Integer, "Loopback port (default: 4777)") { |value| options[:port] = value }
  parser.on("--root PATH", "Repository root (primarily for tests)") { |value| options[:root] = value }
  parser.on("-h", "--help", "Show this help") do
    puts parser
    exit 0
  end
end.parse!

server = ArchitectureReview::Server.new(root: options.fetch(:root), port: options.fetch(:port))
%w[INT TERM].each { |signal| trap(signal) { server.shutdown } }
puts "Architecture review workspace: http://127.0.0.1:#{server.port}/review/"
puts "Local-only: changes still require Preview and Apply in the browser."
server.start
