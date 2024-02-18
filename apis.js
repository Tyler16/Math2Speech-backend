const axios = require('axios');
const fs = require('fs');
const { OpenAI } = require("openai");
require('dotenv').config();

// Mathpix API credentials
const APP_ID = process.env.MATHPIX_ID;
const APP_KEY = process.env.MATHPIX_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY

// Set up GPT
const openai = new OpenAI({apiKey: OPENAI_KEY});

// Mathpix API endpoint
const apiUrl = 'https://api.mathpix.com/v3/latex';

// Set up the HTTP headers
const headers = {
  'app_id': APP_ID,
  'app_key': APP_KEY,
  'Content-type': 'application/json',
};

async function imgToLatex() {
  // Check if credentials are provided
  if (!APP_ID || !APP_KEY) {
    console.error('Please provide valid Mathpix API credentials in the .env file.');
    throw new Error('Please provide valid Mathpix API credentials in the .env file.');
  }

  // Path of image file
  const imagePath = './math.jpg';

  // Read the image file as a base64-encoded string
  const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

  // Prepare the request payload
  const data = {
    src: `data:image/jpg;base64,${imageBase64}`,
    formats: ['latex_simplified'],
  };

  // Make the HTTP POST request to Mathpix API
  response = await axios.post(apiUrl, data, { headers })
  return response
}

async function latexToSpeech(latex) {
  // Check if credentials are provided
  if (!OPENAI_KEY) {
    console.error('Please provide valid OpenAI API credentials in the .env file.');
    throw new Error('Please provide valid OpenAI API credentials in the .env file.');
  }

  const completion = await openai.chat.completions.create({
    messages: [
        {
            role: "system",
            content: "You are a LaTeX to speech generator. You will take in latex equations and turn them into a format that can be read as if a human is reading it. If there are multiple lines, prepend each line with 'line number x', where x is the current line number. Ignore anything saying \\left, \\right, \\begin{array} or \\end{array}.",
        },
        { role: "user", content: latex },
    ],
    model: "gpt-3.5-turbo-0125",
  });
  return completion.choices[0].message.content;
}

module.exports = { imgToLatex, latexToSpeech }