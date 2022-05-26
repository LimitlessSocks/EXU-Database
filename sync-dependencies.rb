require 'open-uri'
require 'addressable/uri'

base = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/"
files = %w(card-viewer.js tag-extract.js)

target = "src/extern/"

files.each { |fp|
    puts "Reading #{fp}..."
    URI.open(base + fp) { |f|
        file = File.open("#{target}/#{fp}", "wb")
        # file.puts "//copied from #{base + fp}"
        # if fp == "tag-extract.js"
            # file.puts 'if(typeof process !== "undefined") CardViewer = require("./../../../../exu-scrape/card-viewer.js");'
        # end
        IO.copy_stream f, file
        file.close
    }
}
puts "Done."
