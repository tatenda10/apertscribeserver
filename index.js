const express = require('express');
const session = require('express-session');

const app = express();
const cors = require('cors');
const Products = require('./routes/Products')
const DiscountController = require('./routes/DiscountRouter')
const Orders = require('./routes/Orders')
const Users = require('./routes/Users')
const paymentprocessing = require('./routes/paymentprocessing')
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/AuthRoutes');
const logoutRoute = require('./routes/Users') // Import the new authRoutes file

app.use(bodyParser.json());

const port = 7000;
 
app.use(cors());
app.use(express.json()); 
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cookieParser());



app.use('/api/v1/products',Products)
app.use('/api/v1/products',Products)
app.use('/api/v1/promotion', DiscountController);

app.use('/api/v1/products/:category',Products)
app.use('/api/v1/products/category/:subcategory',Products)
app.use('/api/v1/products/:category/search',Products)
app.use('/api/v1/products/product/:productId',Products)
app.use('/api/v1/orders',Orders)
app.use('/api/v1/orders/:orderId',Orders)
app.use('/api/v1/paynow',paymentprocessing)  
app.use('/api/v1/updatediscount', DiscountController);




app.use('/api/v1', Users)


 
app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});
