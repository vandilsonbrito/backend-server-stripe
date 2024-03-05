import express from 'express';
import Stripe from 'stripe';
import { config as configDotenv } from 'dotenv';
configDotenv();

// eslint-disable-next-line no-undef
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const stripe = Stripe(STRIPE_API_KEY);

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
    const { cartItems } = req.body;
    console.log(cartItems)
    const lineItems = cartItems.map((item) => ({
        price_data: {
            currency: 'brl',
            product_data: {
                name: item.productName,
            },
            unit_amount: parseInt(item.price * 100),
        },
        quantity: item.quantity,
    }));

    console.log(lineItems);

    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        // eslint-disable-next-line no-undef
        success_url: `${process.env.URL}/checkout-success`,
        // eslint-disable-next-line no-undef
        cancel_url: `${process.env.URL}/CartCheckout`,
    });

    res.send({ url: session.url });
});


export default router



