import express from 'express';
import Stripe from 'stripe';
import { config as configDotenv } from 'dotenv';
configDotenv();

// eslint-disable-next-line no-undef
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const stripe = Stripe(STRIPE_API_KEY);

const router = express.Router();

// Create checkout session with the required parameters
router.post('/create-checkout-session', express.json(), async (req, res) => {
    const { cartItems } = req.body;
    console.log(cartItems)

    const customer = await stripe.customers.create({
        metadata: {
            cart: JSON.stringify(cartItems)
        }
    })

    const lineItems = cartItems.map((item) => ({
        price_data: {
            currency: 'brl',
            product_data: {
                name: item.productName,
                images: [item.image],
            },
            unit_amount: parseInt(item.price * 100),
        },
        quantity: item.quantity,
    }));

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
                display_name: 'Tempo de entrega',
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
        customer: customer.id,
        mode: 'payment',
        // eslint-disable-next-line no-undef
        success_url: `${process.env.URL}/checkout-success`,
        // eslint-disable-next-line no-undef
        cancel_url: `${process.env.URL}`,
    });

    res.send({ url: session.url });
});



// Stripe webhook
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_dd0f50c30b5c9d454e830e3494f80078c5a434af1e017f49e54ce5fc4214591f";

router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event, data, eventType;

  if(endpointSecret) {
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        console.log("Webhood verified");  
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    data = event.data.object;
    eventType = event.type;
  }

  // Handle the event
  if(eventType === "checkout.session.completed") {
    stripe.customers.retrieve(data.customer).then((customer) => {
            
            // Send data to frontend
            const dataFromWebhook = [{
                cart: JSON.parse(customer.metadata.cart),
                amount_subtotal: data.amount_subtotal,
                amount_total: data.amount_total,
                total_details: data.total_details,
                customer_details: data.customer_details
            }];
          
            router.post(`/checkout-success`, (req, res) => {
                res.status(200).json(dataFromWebhook);
            })
           
        }
    ).catch(err => console.log(err.message));
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send().end();
});

export default router



