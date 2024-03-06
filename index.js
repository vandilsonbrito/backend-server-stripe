import express from 'express';
import { json } from 'express';
/* import cors from 'cors'; */

import router from './stripe.js';
const stripe = router;

const app = express();
/* app.use(cors()); */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).send(http.StatusOK);
  } else {
    next();
  }
  
});

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

