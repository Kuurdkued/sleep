const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://www.kurdfonts.com/webfont/407/c937f57e39750032ee6e36fb10e7d746';
const dest = path.join(__dirname, 'public', 'fonts', 'rudaw.zip');
const extractDir = path.join(__dirname, 'public', 'fonts', 'rudaw');

fs.mkdirSync(path.dirname(dest), { recursive: true });

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  const downloadStream = response.statusCode === 301 || response.statusCode === 302 ? https.get(response.headers.location) : response;
  
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, function(res) {
      res.pipe(file);
      file.on('finish', async function() {
        file.close();
        console.log('Downloaded');
        try {
          const extract = require('extract-zip');
          await extract(dest, { dir: extractDir });
          console.log('Extracted');
        } catch (e) {
          console.error('Extraction failed', e);
        }
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', async function() {
      file.close();
      console.log('Downloaded');
      try {
        const extract = require('extract-zip');
        await extract(dest, { dir: extractDir });
        console.log('Extracted');
      } catch (e) {
        console.error('Extraction failed', e);
      }
    });
  }
});
