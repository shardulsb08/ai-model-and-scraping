import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urlunparse

# Configuration
BASE_URL = "https://harshninave.netlify.app/"  # Replace with your website URL
OUTPUT_FILE = "website_content.txt"
VISITED_ROUTES = set()

# Initialize the WebDriver (e.g., Chrome)
driver = webdriver.Chrome()  # Make sure chromedriver is in your PATH

def normalize_url(url):
    """Normalize the URL by removing query parameters and hash fragments."""
    parsed_url = urlparse(url)
    # Remove query and fragment
    normalized_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, "", "", ""))
    return normalized_url

def extract_text_from_page(url):
    """Extract text content from the given URL."""
    driver.get(url)
    time.sleep(2)  # Wait for the page to load completely (adjust as needed)

    # Get the page source and parse it with BeautifulSoup
    soup = BeautifulSoup(driver.page_source, "html.parser")
    
    # Extract text content
    text_content = soup.get_text(separator="\n")
    return text_content

def find_routes(url):
    """Find all unique routes (links) on the page."""
    driver.get(url)
    time.sleep(2)  # Wait for the page to load completely

    # Find all anchor tags
    links = driver.find_elements(By.TAG_NAME, "a")
    
    routes = set()
    for link in links:
        href = link.get_attribute("href")
        if href and href.startswith(BASE_URL):
            # Normalize the URL before adding it to the set
            normalized_href = normalize_url(href)
            routes.add(normalized_href)
    
    return routes

def scrape_website(start_url):
    """Scrape the website starting from the given URL."""
    global VISITED_ROUTES

    # Initialize a queue for BFS
    queue = [start_url]

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        while queue:
            current_url = queue.pop(0)

            # Normalize the current URL
            normalized_url = normalize_url(current_url)

            if normalized_url in VISITED_ROUTES:
                continue

            print(f"Scraping: {current_url}")
            VISITED_ROUTES.add(normalized_url)

            # Extract text content
            text_content = extract_text_from_page(current_url)
            f.write(f"URL: {current_url}\n")
            f.write(text_content)
            f.write("\n\n")

            # Find new routes
            new_routes = find_routes(current_url)
            for route in new_routes:
                if route not in VISITED_ROUTES:
                    queue.append(route)

# Start scraping
scrape_website(BASE_URL)

# Close the WebDriver
driver.quit()