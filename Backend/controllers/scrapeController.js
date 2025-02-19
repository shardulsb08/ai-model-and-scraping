const WebsiteContent = require('../models/WebsiteContent');
const { runScraper } = require('../utils/scraperRunner');

const scrapeWebsite = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Run the Python scraper script
    const scrapedContent = await runScraper(url);

    // Extract domain from URL (e.g., "https://example.com" -> "example.com")
    const domain = new URL(url).hostname;

    // Save the scraped content to MongoDB
    const websiteContent = new WebsiteContent({
      domain,
      content: scrapedContent,
    });
    await websiteContent.save();

    // Return the scraped content to the frontend
    res.json({ content: scrapedContent });
  } catch (error) {
    console.error('Error scraping website:', error);
    res.status(500).json({ error: 'Failed to scrape website' });
  }
};

module.exports = { scrapeWebsite };
