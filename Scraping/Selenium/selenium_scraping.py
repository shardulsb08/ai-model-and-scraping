from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from urllib.parse import urljoin
import time

# Set up Selenium with Chrome (automatically downloads ChromeDriver)
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# Base URL of the website to scrape
base_url = "https://harshninave.netlify.app"  # Replace with the website you want to scrape

# Set to keep track of visited URLs
visited_urls = set()

# File to store all scraped data
output_file = "all_scraped_data.txt"

# Function to scrape a page and extract all links
def scrape_page(url):
    # Skip if the URL has already been visited
    if url in visited_urls:
        return
    visited_urls.add(url)  # Mark the URL as visited

    # Open the page
    driver.get(url)
    time.sleep(2)  # Wait for the page to load

    # Extract all text content from the page
    page_content = driver.find_element(By.TAG_NAME, "body").text

    # Append the content to the output file
    with open(output_file, "a", encoding="utf-8") as file:
        file.write(f"URL: {url}\n")  # Write the URL as a header
        file.write(page_content + "\n\n")  # Write the page content
    print(f"Scraped: {url}")

    # Extract all links on the page
    links = driver.find_elements(By.TAG_NAME, "a")
    for link in links:
        href = link.get_attribute("href")
        if href and href.startswith(base_url):  # Ensure the link belongs to the same website
            full_url = urljoin(base_url, href)  # Resolve relative URLs
            scrape_page(full_url)  # Recursively scrape the new link

# Start scraping from the base URL
scrape_page(base_url)

# Close the browser
driver.quit()