import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import { authenticate } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set in .env, Stripe payments won’t work');
  // throw new Error('STRIPE_SECRET_KEY is not set in .env');
}


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // or latest
});

// Create payment intent (Stripe)
router.post('/create-payment-intent', authenticate, async (req, res) => {

  console.log('📦 Received payment intent request body:', req.body);
  console.log('🔐 Authenticated user:', req.user);

  try {
    const { amount, currency = 'usd' } = req.body;

    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        userName: req.user.name
      }
    });

    console.log('✅ Stripe PaymentIntent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(400).json({
      message: error.message,
      type: 'stripe_error'
    });
  }
});

// Store payment details
router.post('/store-payment', authenticate, async (req, res) => {
  try {
    const {
      bookingId,
      paymentId,
      amount,
      currency,
      paymentMethod,
      status,
      receiptUrl
    } = req.body;

    // Update booking with payment details
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentId,
        paymentStatus: status === 'succeeded' ? 'completed' : 'failed',
        paymentDetails: {
          amount,
          currency,
          paymentMethod,
          status,
          receiptUrl,
          processedAt: new Date()
        }
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      booking,
      message: 'Payment details stored successfully'
    });
  } catch (error) {
    console.error('Store payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Process fake payment
router.post('/fake-payment', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate fake payment ID
    const fakePaymentId = `fake_payment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    res.json({
      success: true,
      paymentId: fakePaymentId,
      amount,
      currency: 'usd',
      status: 'succeeded',
      message: 'Demo payment processed successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Webhook endpoint for Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(400).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);

      // Update booking status
      try {
        await Booking.updateMany(
          { paymentId: paymentIntent.id },
          {
            paymentStatus: 'completed',
            status: 'confirmed'
          }
        );
      } catch (error) {
        console.error('Error updating booking:', error);
      }
      break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;