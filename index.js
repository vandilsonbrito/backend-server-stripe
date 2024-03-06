import express from 'express';
import { json } from 'express';
import cors from 'cors';

import router from './stripe.js';
const stripe = router;

const app = express();

// Middleware to enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// Apply CORS middleware to all routes
app.use(allowCors);

// Additional middleware
app.use(json());

// Routes
app.use("/CartCheckout/stripe", stripe);

// Default route
app.get('/', (req, res) => {
  res.send('Servidor do backend está funcionando!');
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor do backend está rodando em http://localhost:${port}`);
});
