import express from 'express';
import Stripe from 'stripe';
import { config as configDotenv } from 'dotenv';
configDotenv();

// eslint-disable-next-line no-undef
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const stripe = Stripe(STRIPE_API_KEY);
const url = process.env.URL;

const router = express.Router();

// Create checkout session with the required parameters
router.post('/create-checkout-session', express.json(), async (req, res) => {
    const { cartItems } = req.body;

    console.log(cartItems)  

    const customer = await stripe.customers.create({
        metadata: {
            cart: JSON.stringify(cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            })))
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
        //process.env.URL
        success_url: `${url}/checkout-success`,
        // eslint-disable-next-line no-undef
        cancel_url: `${url}`,
    });

    res.send({ url: session.url });
});



// Stripe webhook

const endpointSecret = process.env.SECRET_SIGNATURE;
console.log('Entrando em Webhook!');

let checkoutData;
router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
  console.log("SIG ", sig) 

  let event, data, eventType;
    console.log('Passou por Webhook!');
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
        stripe.customers.retrieve(data.customer)
            .then((customer) => {

                const id = customer.id;
                const cart = JSON.parse(customer.metadata.cart);
                
                checkoutData = [{
                    id,    
                    cart,
                    amount_subtotal: data.amount_subtotal,
                    amount_total: data.amount_total,
                    total_details: data.total_details,
                    customer_details: data.customer_details
                }];
                
            }
        ).catch(err => console.log(err.message));
    }
    else {
        response.status(200).send("Event not handled");
    }   


  // Return a 200 response to acknowledge receipt of the event
  response.status(200).end()
});


router.get('/checkout-success', async (req, res) => {
    try {
        // Return a 200 response to acknowledge receipt of the event and send webhook data to frontend
        res.status(200).json(checkoutData);
    } catch (error) {
        console.error('Erro ao obter os dados do último checkout: ', error);
        res.status(500).send('Erro ao obter os dados do último checkout');
    }
});


export default router



