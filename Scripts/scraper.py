from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from urllib.parse import urljoin
import time
import sys

# Get the URL from the command-line argument
if len(sys.argv) < 2:
    print("Usage: python scraper.py <url>")
    sys.exit(1)

base_url = sys.argv[1]
print(f"Scraping website: {base_url}")  # Debugging

# Set up Selenium with Chrome (automatically downloads ChromeDriver)
try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    print("ChromeDriver initialized successfully")  # Debugging
except Exception as e:
    print(f"Error initializing ChromeDriver: {e}")
    sys.exit(1)

# Set to keep track of visited URLs
visited_urls = set()

# Function to scrape a page and extract all links
def scrape_page(url):
    # Skip if the URL has already been visited
    if url in visited_urls:
        return
    visited_urls.add(url)  # Mark the URL as visited

    # Open the page
    print(f"Opening URL: {url}")  # Debugging
    try:
        driver.get(url)
        time.sleep(2)  # Wait for the page to load
    except Exception as e:
        print(f"Error opening URL {url}: {e}")
        return

    # Extract all text content from the page
    try:
        page_content = driver.find_element(By.TAG_NAME, "body").text
        print(f"Scraped content from {url}")  # Debugging
    except Exception as e:
        print(f"Error scraping content from {url}: {e}")
        return

    # Append the content to the output file
    try:
        with open("all_scraped_data2.txt", "a", encoding="utf-8") as file:
            file.write(f"URL: {url}\n")  # Write the URL as a header
            file.write(page_content + "\n\n")  # Write the page content
        print(f"Saved content from {url} to file")  # Debugging
    except Exception as e:
        print(f"Error saving content to file: {e}")

    # Extract all links on the page
    try:
        links = driver.find_elements(By.TAG_NAME, "a")
        for link in links:
            href = link.get_attribute("href")
            if href and href.startswith(base_url):  # Ensure the link belongs to the same website
                full_url = urljoin(base_url, href)  # Resolve relative URLs
                scrape_page(full_url)  # Recursively scrape the new link
    except Exception as e:
        print(f"Error extracting links from {url}: {e}")

# Start scraping from the base URL
scrape_page(base_url)

# Close the browser
driver.quit()
print("Scraping completed successfully")  # Debugging

# Print the scraped content to stdout (for the backend to capture)
try:
    with open("all_scraped_data2.txt", "r", encoding="utf-8") as file:
        print(file.read())
except Exception as e:
    print(f"Error reading scraped content: {e}")