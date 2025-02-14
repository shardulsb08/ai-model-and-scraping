const { spawn } = require('child_process');

const generateAIResponse = async (prompt) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['chatbot.py', prompt]);
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
      const answer = result.split('Answer: ')[1]?.trim();
      resolve(answer || 'Sorry, I could not generate a response.');
    });
  });
};

module.exports = { generateAIResponse };
