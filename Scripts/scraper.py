from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from urllib.parse import urljoin
import time
import sys

import requests
import fitz  # pymupdf
import os

# Get the URL from the command-line argument
if len(sys.argv) < 2:
    print("Usage: python scraper.py <url>", file=sys.stderr)
    sys.exit(1)

base_url = sys.argv[1]
print(f"Scraping website: {base_url}", file=sys.stderr)  # Debugging to stderr

# Set up Selenium with Chrome (automatically downloads ChromeDriver)
try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    print("ChromeDriver initialized successfully", file=sys.stderr)  # Debugging to stderr
except Exception as e:
    print(f"Error initializing ChromeDriver: {e}", file=sys.stderr)
    sys.exit(1)

# Set to keep track of visited URLs
visited_urls = set()

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_url):
    try:
        # Download the PDF
        response = requests.get(pdf_url)
        pdf_path = "temp.pdf"
        with open(pdf_path, "wb") as pdf_file:
            pdf_file.write(response.content)

        # Extract text from the PDF
        text = ""
        with fitz.open(pdf_path) as pdf_document:
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                text += page.get_text()

        # Delete the temporary PDF file
        os.remove(pdf_path)
        return text
    except Exception as e:
        print(f"Error extracting text from PDF {pdf_url}: {e}", file=sys.stderr)
        return ""

# Function to scrape a page and extract all links
def scrape_page(url):
    # Skip if the URL has already been visited
    if url in visited_urls:
        return ""
    visited_urls.add(url)  # Mark the URL as visited

    # Open the page
    print(f"Opening URL: {url}", file=sys.stderr)  # Debugging to stderr
    try:
        driver.get(url)
        time.sleep(2)  # Wait for the page to load
    except Exception as e:
        print(f"Error opening URL {url}: {e}", file=sys.stderr)
        return ""

    # Extract all text content from the page
    try:
        page_content = driver.find_element(By.TAG_NAME, "body").text
        print(f"Scraped content from {url}", file=sys.stderr)  # Debugging to stderr
    except Exception as e:
        print(f"Error scraping content from {url}: {e}", file=sys.stderr)
        return ""

    # Extract all links on the page
    try:
        links = driver.find_elements(By.TAG_NAME, "a")
        for link in links:
            href = link.get_attribute("href")
            if href:
                # Handle PDF links
                if href.endswith(".pdf"):
                    print(f"Found PDF: {href}", file=sys.stderr)
                    pdf_text = extract_text_from_pdf(href)
                    page_content += f"\n\nPDF Content from {href}:\n{pdf_text}"
                # Handle regular links
                elif href.startswith(base_url):  # Ensure the link belongs to the same website
                    full_url = urljoin(base_url, href)  # Resolve relative URLs
                    if full_url not in visited_urls:
                        page_content += "\n" + scrape_page(full_url)  # Recursively scrape the new link
    except Exception as e:
        print(f"Error extracting links from {url}: {e}", file=sys.stderr)

    return page_content

# Start scraping from the base URL
try:
    scraped_content = scrape_page(base_url)
    print("Scraping completed successfully", file=sys.stderr)  # Debugging to stderr
except Exception as e:
    print(f"Error during scraping: {e}", file=sys.stderr)
    scraped_content = ""

# Close the browser
driver.quit()

# Print ONLY the scraped content to stdout (for the backend to capture)
sys.stdout.buffer.write(scraped_content.encode('utf-8'))
