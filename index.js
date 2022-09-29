const express = require('express');
const morgan = require("morgan");
const axios = require('axios')
const cors = require('cors')

// Create Express Server
const app = express();

// Configuration
const PORT = 3100;
const HOST = "localhost";
const API_SERVICE_URL = process.env.API_SERVICE;

// Logging
app.use(morgan('dev'));

// CORS
app.use(
  cors({
    credentials: false, // for cookies
    origin: true,
    methods: ['OPTIONS', 'GET', 'PUT', 'POST']
  }),
  (req, res, next) => {
    console.log('res headers => ', res.getHeaders())
    next();
  }
)

// Proxy
app.use('*', async (req, res) => {
  const url = `${API_SERVICE_URL}/${req.originalUrl}`
  // const url = req.originalUrl;
  const method = req.method.toLowerCase();

  console.log('req originalUrl => ', req.originalUrl)
  // console.log('req method => ', req.method)
  console.log('req headers => ', req.headers)
  // console.log('res headers => ', res.getHeaders())

  try {
    const response = await axios({
      method,
      url,
      headers: {
        accept: req.get('Accept'),
        'user-agent': req.get('X-User-Agent'),
        'content-type': req.get('Content-type'),
        authorization: req.get('Authorization'),
      },
    });

    console.log('data => ', response.data)
    return res.status(200).send(response.data)
  } catch (error) {
    const { response, message } = error;

    const responseData = {
      message,
      data: response.data,
      headers: response.headers
    }

    console.log('err => ', responseData)
    return res.status(response.status).send(responseData);
  }
})

// Info GET endpoint
app.get('/info', (req, res, next) => {
  res.send('This is a proxy service which proxies to Billing and Account APIs.');
});


// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
