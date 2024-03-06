import express from 'express';
import { json } from 'express';
import cors from 'cors';

import router from './stripe.js';
const stripe = router;

const app = express();
app.use(cors({
  origin: ['https://delicias-da-casa.netlify.app', 'http://localhost:3001'] // Adicione aqui os domínios permitidos
}));
const port = process.env.PORT || 3001; 

// Middleware to parse JSON and set up
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://delicias-da-casa.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.use("/CartCheckout/stripe", stripe)
app.use(json());

app.get('/', (req, res) => {
  res.send('Servidor do backend está funcionando!');
});

app.post('/create-checkout-session', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erro ao criar o pagamento:', error);
    res.status(500).send({ error: 'Erro ao criar o pagamento' });
  }
});

app.listen(port, () => {
  console.log(`Servidor do backend está rodando em http://localhost:${port}`);
});


/* 
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

*/