import http from 'node:http';
import fs from 'node:fs/promises';
import formidable from 'formidable';
import { imgToLatex, latexToSpeech } from './apis.js';

// Start server
const server = http.createServer(async (req, res) => {
  console.log("Request Received");

  // Check API endpoint
  if (req.url === '/api/upload' && req.method.toLowerCase() === 'post') {
    const form = formidable({});

    // Get image file
    try {
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
          } else {
            resolve({ fields, files });
          }
        });
      });

      console.log("File Info:\n" + files.photo[0].filepath);

      // Add file to the correct directory
      await fs.rename(files.photo[0].filepath, './math.jpg');
      
      // Convert file to LaTeX
      let latex = await imgToLatex();
      let latexString = latex.data.latex_simplified;
      console.log("Latex: " + latexString);

      // Convert to speakable format
      let speech = await latexToSpeech(latexString);
      console.log(speech);

      // Return information
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ latexString, speech }, null, 2));
    } catch (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
    }

    return;
  }

  // Generate test web page
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h2>File Upload Test Server</h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div> Title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="photo" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000/ ...');
});