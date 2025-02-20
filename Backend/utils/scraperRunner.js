const { spawn } = require('child_process');

const runScraper = (url) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['../scripts/scraper.py', url]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString(); // Capture only stdout (scraped content)
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString(); // Log stderr (debug logs) to the console
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}: ${error}`);
        reject(new Error(`Python process exited with code ${code}: ${error}`));
        return;
      }
      console.log(`Python output: ${result}`); // Log the scraped content
      resolve(result.trim()); // Resolve with the scraped content
    });
  });
};

module.exports = { runScraper };
