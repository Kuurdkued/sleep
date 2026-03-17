const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://www.kurdfonts.com/dl/tmp/3011294/rudawregular2.ttf';
const dest = path.join(__dirname, 'public', 'fonts', 'rudawregular2.ttf');

fs.mkdirSync(path.dirname(dest), { recursive: true });

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Downloaded direct');
  });
});
