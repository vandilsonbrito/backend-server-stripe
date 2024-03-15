import express from 'express';
import cors from 'cors';

import router from './stripe.js';
const stripe = router;

const app = express();
const port =  3000; 


app.use(express.urlencoded({ extended: true })); 
app.use(cors());

// Route obly to inform server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Route to inform server that any request from '/cart-checkout/stripe' route will be processed by the middleware in /stripe.js
app.use("/cart-checkout/stripe", stripe);


// Route to create a checkout session
app.post('/create-checkout-session', express.json(), async (req, res) => {
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

// Route to pass webhook data to frontend 
app.get('/checkout-success', express.json(), stripe);


app.listen(process.env.PORT || port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

