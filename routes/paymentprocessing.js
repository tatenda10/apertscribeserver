const express = require('express');
const router = express.Router();
const { Paynow } = require('paynow');
const { createOrder } = require('../controllers/Products'); // Import the updated createOrder function
const { updateOrderStatusById } = require('../controllers/Products'); 

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  return result;
}

// Function to generate a Paynow reference
function generatePaynowReference() {
  const timestamp = new Date().getTime(); // Get current timestamp
  const randomString = generateRandomString(7); // Generate a 7-character random string
  return `PAYNOW-${timestamp}-${randomString}`;
}

// Example usage
const paynowReference = generatePaynowReference();
console.log(paynowReference);


// Replace with your actual integration details
const paynowIntegrationId = '16699';
const paynowIntegrationKey = '8df1ac17-ead7-45b8-90a9-04c7053dba01';

// Create an instance of Paynow
const paynow = new Paynow(paynowIntegrationId, paynowIntegrationKey);

// Set result and return URLs
paynow.resultUrl = 'http://example.com/gateways/paynow/update';
paynow.returnUrl = 'http://http://localhost:3000/Cart';



// Define the route to initiate the Paynow transaction
router.post('/', async (req, res) => {
  try {
    const orderDetails = req.body;
    orderDetails.transaction_date = new Date();

    const payment = paynow.createPayment(orderDetails.paynowReference);
    payment.add('Order Total', orderDetails.amount_paid);
    const paynowResponse = await paynow.send(payment);
    console.log(paynowResponse);

    if (paynowResponse.success) {
      const result = await createOrder(
        orderDetails.customer_name,
        orderDetails.address,
        orderDetails.email,
        orderDetails.phone_number,
        orderDetails.amount_paid,
        orderDetails.order_items,
        orderDetails.transaction_date,
        orderDetails.Delivery_date,
        paynowReference,
        paynowResponse.pollUrl
      );

      // Assuming that your order_id is returned in the result or fetch it from the database
      const orderId = result.insertId;

      // Start the polling loop immediately after creating the order
      await pollPaymentStatus(paynowResponse.pollUrl, orderId);

      const redirectLink = paynowResponse.redirectUrl;
      res.json({ redirectLink, pollUrl: paynowResponse.pollUrl, result });
    } else {
      res.status(500).json({ error: paynowResponse.error });
    }
  } catch (error) {
    console.error('Error sending payment to Paynow:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const pollPaymentStatus = async (pollUrl, orderId) => {
  try {
    const response = await fetch(pollUrl);
    const responseBody = await response.text();
    console.log('Response Body:', responseBody);

    // Use URLSearchParams to parse the URL-encoded string
    const params = new URLSearchParams(responseBody);
    const status = params.get('status');

    // Now you can check the status and handle it accordingly
    if (status === 'Paid') {
      console.log('Payment was successful!');
      // Update the order status in the database
      await updateOrderStatusById(orderId, 'Paid');
    } else {
      console.log('Payment status:', status);
      // Update the order status in the database accordingly
      await updateOrderStatusById(orderId, status);
    }

  } catch (error) {
    console.error('Error polling payment status:', error);
  }
};


module.exports = router;
