import express from 'express';
import { json } from 'express';
import cors from 'cors';

import router from './stripe.js';
const stripe = router;

const app = express();
app.use(cors());
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

