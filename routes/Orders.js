const express = require('express')
const router = express.Router();
const upload = require('../middleware/middleware');
const { createOrder, getAllOrders,getOrderById } = require('../controllers/Products');

// Endpoint to create an order
router.post('/', async (req, res) => {
    const orderDetails = req.body;
    orderDetails.transaction_date = new Date(); // Add transaction_date to orderDetails
  
    try {
      const result = await createOrder(
        orderDetails.customer_name,
        orderDetails.address,
        orderDetails.email,
        orderDetails.phone_number,
        orderDetails.amount_paid,
        orderDetails.order_items,
        orderDetails.transaction_date, // Pass the transaction_date
        orderDetails.Delivery_date,
        'Pending'
        
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});




router.get('/', async (req, res) => {
    let { page, pageSize } = req.query;

    // Default values for page and pageSize
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 8;

    try {
        const orders = await getAllOrders(page, pageSize);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:orderId', async (req, res) => {
    const orderId = parseInt(req.params.orderId, 10);
  
    try {
      console.log('Fetching order with ID:', orderId); // Log the orderId
      const order = await getOrderById(orderId);
      
      if (!order) {
        console.log('Order not found in the database');
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
