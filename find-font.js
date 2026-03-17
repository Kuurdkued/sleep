const https = require('https');

https.get('https://www.kurdfonts.com/font-info/407', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});
