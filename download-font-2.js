const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://www.kurdfonts.com/download/407/c937f57e39750032ee6e36fb10e7d746';
const dest = path.join(__dirname, 'public', 'fonts', 'rudaw.zip');

fs.mkdirSync(path.dirname(dest), { recursive: true });

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, function(res) {
      res.pipe(file);
      file.on('finish', function() {
        file.close();
        console.log('Downloaded redirected');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log('Downloaded direct');
    });
  }
});
