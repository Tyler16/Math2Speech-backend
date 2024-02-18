import http from 'node:http';
import fs from 'node:fs';
import formidable from 'formidable';
import { imgToLatex, latexToSpeech } from './apis.js';

const server = http.createServer((req, res) => {
  console.log("Request Recieved");

  // Check API endpoint
  if (req.url === '/api/upload' && req.method.toLowerCase() === 'post') {
    const form = formidable({});

    // Get image file
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
        res.end(String(err));
        return;
      }

      console.log("File Info:\n" + files.photo[0].filepath);

      // Add file to correct directory
      await fs.rename(files.photo[0].filepath, './equation.jpg', (err) => {
        if (err) throw err;
        console.log("File Successfully Saved");
      });
      
      let latex = await imgToLatex();
      let latexString = latex.data.latex_simplified;
      console.log("Latex: " + latexString);

      let speech = await latexToSpeech(latexString);
      console.log(speech);

      // Return API info
      await res.writeHead(200, { 'Content-Type': 'application/json' });
      await res.end(JSON.stringify({ latexString, speech }, null, 2));
    });

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