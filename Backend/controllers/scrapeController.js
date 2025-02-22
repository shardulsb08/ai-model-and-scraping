const WebsiteContent = require('../models/WebsiteContent');
const { runScraper } = require('../utils/scraperRunner');

const scrapeWebsite = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {

    const domain = new URL(url).hostname;

    // Check if the domain already exists in mongodb
    const existingContent = await WebsiteContent.findOne({ domain });

    if (existingContent) {
      return res
        .status(200)
        .json({ message: 'Domain content already exists.', content: existingContent.content });
    }

    // Run the Python scraper script
    const scrapedContent = await runScraper(url);

    // Save the scraped content to MongoDB
    const websiteContent = new WebsiteContent({
      domain,
      content: scrapedContent,
    });
    await websiteContent.save();

    // Return the scraped content to the frontend
    res.json({
      message: 'Website scraped successfully! You can now chat with the assistant.',
      content: scrapedContent,
    });
  } catch (error) {
    console.error('Error scraping website:', error);
    res.status(500).json({ error: 'Failed to scrape website' });
  }
};

module.exports = { scrapeWebsite };
