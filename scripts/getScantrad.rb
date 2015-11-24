#!/usr/bin/env ruby
#

require 'rubygems'
require 'nokogiri'
require 'open-uri'
require 'mechanize'
require 'json'
require "i18n"
require 'zip'


HEADERS_HASH = {"User-Agent" => "Ruby/#{RUBY_VERSION}"}
# BASE_URL = "http://lel-scan.com/mangas/one-piece/"
#BASE_URL = "http://www.lecture-en-ligne.com/images/manga/shingekinokyojin/"
 BASE_URL = "http://lel-scan.co/mangas/shingeki-no-kyojin/"



DATA_DIR = "data/scan"
PAGE_IDS = 0..80
# I18n.default_locale = :en

VOLUMES = {
  "01" => 1..4,
  "02" => 5..9,
  "03" => 10..13,
  "04" => 14..18,
  "05" => 19..22,
  "06" => 23..26,
  "07" => 27..30,
  "08" => 31..34,
  "09" => 35..38,
  "10" => 39..42,
  "11" => 43..46,
  "12" => 47..50,
  "13" => 51..54,
  "14" => 55..58,
  "15" => 59..62,
  "16" => 63..66,
  "17" => 67..70,
  "18" => 71..74
}


VOLUMES = {
  "17" => 67..70,
  "18" => 71..74
}

CHAPTER_IDS = 17..18

VOLUMES.each do |volume_id, chapters|

  fileList = []

  chapters.each do |chapter_id|

    PAGE_IDS.each do |page_id|

      page_real_id = "0#{page_id}"[-2,2]

# 66/03.jpg?v=f
      page_url = "#{BASE_URL}#{chapter_id}/#{page_real_id}.jpg?v=f"
      alternate_page_url = "#{BASE_URL}#{chapter_id}/#{page_id}.jpg"
      fname = "T#{volume_id}-C#{chapter_id}-P#{page_real_id}.jpg"
      local_fname = "#{DATA_DIR}/#{volume_id}/T#{volume_id}-C#{chapter_id}-P#{page_real_id}.jpg"

      puts page_url

      agent = Mechanize.new

      cookie = Mechanize::Cookie.new("mobile-lelscan", "0")
      cookie.domain = "lel-scan.com"
      cookie.path = "/lecture-one-piece"
      agent.cookie_jar.add(cookie)

      agent.request_headers = { 'referer' =>  'http://lel-scan.com/lecture-one-piece/#{chapter_id}/#{page_real_id}'}

      begin
        agent.get(page_url).save! local_fname
        fileList.push(fname)

      rescue
        if page_id < 10
          begin
            agent.get(alternate_page_url).save! local_fname
            fileList.push(fname)
          rescue
            puts "alternate image : #{alternate_page_url} and #{page_url} not found"
          end
        else
          puts "image : #{page_url} not found"
        end
      end

    end

  end

  folder = "#{DATA_DIR}/#{volume_id}"
  zipfile_name = "#{DATA_DIR}/T-#{volume_id}.cbz"
  input_filenames = fileList
  Zip::File.open(zipfile_name, Zip::File::CREATE) do |zipfile|
    input_filenames.each do |filename|
      # Two arguments:
      # - The name of the file as it will appear in the archive
      # - The original file, including the path to find it
      zipfile.add(filename, folder + '/' + filename)
    end
    zipfile.get_output_stream("myFile") { |os| os.write "myFile contains just this" }
  end

end
