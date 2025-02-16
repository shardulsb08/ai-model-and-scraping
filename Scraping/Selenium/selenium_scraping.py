from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

# Set up Selenium with Chrome (automatically downloads ChromeDriver)
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# Open the target website
url = "https://www.pranavayus.com"  # Replace with the website you want to scrape
driver.get(url)

# Wait for the page to load
time.sleep(3)  # Adjust the sleep time based on the website's loading speed

# Extract all text content from the page
page_content = driver.find_element(By.TAG_NAME, "body").text

# Save the content to a .txt file
with open("website_content.txt", "w", encoding="utf-8") as file:
    file.write(page_content)

print("Website content saved to 'website_content.txt'")

# Close the browser
driver.quit()