const { spawn } = require('child_process');

const runScraper = (url) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['../scripts/scraper.py', url]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
        return;
      }
      resolve(result.trim());
    });
  });
};

module.exports = { runScraper };
