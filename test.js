import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tutor/ask',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

const payload = JSON.stringify({
  question: 'How do I reverse a string?',
  language: 'JavaScript',
  level: 'beginner'
});

req.write(payload);
req.end();
