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
        phone_number_collection: {
            enabled: true
        }, 
        shipping_address_collection: {
            allowed_countries: ['BR']
        }, 
        shipping_options: [{
            shipping_rate_data: {
                display_name: 'Taxa de entrega',
                delivery_estimate: {
                    maximum: {
                        unit: 'hour',
                        value: 1
                    }
                },  
                type: 'fixed_amount',
                fixed_amount: {
                    amount: 500,
                    currency: 'BRL'
                }
            }
        }],
        mode: 'payment',
        // eslint-disable-next-line no-undef
        success_url: `${process.env.URL}/checkout-success`,
        // eslint-disable-next-line no-undef
        cancel_url: `${process.env.URL}`,
    });

    res.send({ url: session.url });
});


export default router



