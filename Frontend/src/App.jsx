import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import { Globe, Search, CheckCircle, XCircle } from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('');
  const [isScraped, setIsScraped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDomain, setCurrentDomain] = useState('');

  const handleScrape = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }

      await response.json();
      const domain = new URL(url).hostname;
      setCurrentDomain(domain);
      setIsScraped(true);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to scrape website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Website Scraper Assistant</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* URL Input Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Enter Website URL</h2>

            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={handleScrape}
              disabled={isLoading}
              className={`mt-4 w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 
                ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}>
              {isLoading ? 'Scraping...' : 'Start Scraping'}
            </button>

            {/* Status Messages */}
            {error && (
              <div className="mt-4 flex items-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}
            {isScraped && !error && (
              <div className="mt-4 flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <p>Website scraped successfully! You can now chat with the assistant.</p>
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How it works</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <p className="text-gray-600">Enter the URL of the website you want to analyze</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <p className="text-gray-600">Wait for the scraping process to complete</p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <p className="text-gray-600">
                  Use the chat assistant to ask questions about the website
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot domain={currentDomain} isScraped={isScraped} />
    </div>
  );
};

export default App;
