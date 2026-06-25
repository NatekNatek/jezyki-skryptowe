require 'nokogiri'
require 'httparty'

MAX_PRODUCTS = 10

BASE_URL = "https://www.amazon.pl"

HEADERS = {
  "User-Agent"      => "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " \
                       "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept-Language" => "en-US,en;q=0.9",
  "Accept"          => "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "DNT"             => "1",
}.freeze

keyword = ARGV.first
if keyword.nil? || keyword.strip.empty?
  warn "Usage: ruby amazon_crawler.rb \"keyword\""
  exit 1
end

def fetch(url)
  response = HTTParty.get(url, headers: HEADERS, follow_redirects: true, timeout: 15)
  raise "HTTP #{response.code}" unless response.success?
  response.body
rescue => e
  warn "Request failed: #{e.message}"
  nil
end

Product = Struct.new(:title, :price, :rating, :reviews, :badge, :url, keyword_init: true)

def parse_products(html)
  doc = Nokogiri::HTML(html)

  if doc.at_css('form[action="/errors/validateCaptcha"]') || doc.title&.include?("Robot Check")
    warn "Blocked by CAPTCHA — Amazon detected automated access."
    return []
  end

  doc.css('div[data-component-type="s-search-result"]').filter_map do |item|
    asin = item['data-asin']
    next if asin.nil? || asin.empty?

    h2          = item.at_css('h2')
    title       = h2&.at_css('a span')&.text&.strip ||
                  h2&.at_css('span')&.text&.strip   ||
                  h2&.[]('aria-label')&.strip        ||
                  h2&.text&.strip
    price       = item.at_css('span.a-price span.a-offscreen')&.text&.strip
    rating      = item.at_css('span.a-icon-alt')&.text&.match(/^[\d.]+/)&.[](0)
    reviews_el  = item.at_css('span[aria-label*="ratings"], a span.a-size-base')
    badge       = item.at_css('span.a-badge-label span.a-badge-label-inner span')&.text&.strip

    Product.new(title: title, price: price, rating: rating, badge: badge, url: "#{BASE_URL}/dp/#{asin}")
  end
end

def display(products, keyword)
  puts "\n#{"=" * 70}"
  puts "  Results for: \"#{keyword}\"  (#{products.size} products)"
  puts "=" * 70

  products.each_with_index do |p, i|
    badge_str = p.badge ? " [#{p.badge}]" : ""
    puts "\n#{i + 1}.#{badge_str} #{p.title || "(no title)"}"
    puts "   Price:   #{p.price  || "N/A"}"
    puts "   Rating:  #{p.rating ? "#{p.rating}/5" : "N/A"}"
    puts "   URL:     #{p.url}"
  end

  puts "\n#{"=" * 70}\n"
end

puts "Searching Amazon for \"#{keyword}\"..."

params = URI.encode_www_form(k: keyword)
html   = fetch("#{BASE_URL}/s?#{params}")
exit 1 unless html

products = parse_products(html).first(MAX_PRODUCTS)

if products.empty?
  puts "No products found. Amazon may have blocked the request — try again later."
  exit 1
end

display(products, keyword)
