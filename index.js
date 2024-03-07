/* import express from 'express';
import { json } from 'express';


import router from './stripe.js';
const stripe = router;

const app = express();

const port =  3000; 

// Middleware to parse JSON and set up
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use("/CartCheckout/stripe", stripe)
app.use(json());

app.get('/', (req, res) => {
  res.send('Server is running!');
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
    console.error('Error creating Payment Intent: ', error);
    res.status(500).send({ error: 'Error creating Payment' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

 */

import express from 'express';
import microCors from 'micro-cors';
import router from './stripe.js';

const stripe = router;
const app = express();
const port = 3000;

// Middleware to parse JSON and set up
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Defina a função do seu aplicativo
function MyApi(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // handling other requests normally after this
}

// Inicialize o micro-cors
const cors = microCors();

// Use o micro-cors como middleware para todas as rotas
app.use(cors(MyApi));

// Defina suas rotas
app.use("/CartCheckout/stripe", stripe);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/create-checkout-session', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    // Código para criar um pagamento aqui
    res.status(200).json({ message: 'Payment created successfully' });
  } catch (error) {
    console.error('Error creating Payment: ', error);
    res.status(500).send({ error: 'Error creating Payment' });
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
