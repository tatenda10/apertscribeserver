const express = require('express')
const router = express.Router();
const upload = require('../middleware/middleware');

const app = express();
const path = require('path'); 



 


const {  searchProductsInCategory,getProductsBySubCategory,updateProduct,deleteProduct,getAllProducts, getProductsByCategory,createProduct,getProductById}= require('../controllers/Products')




router.get('/', async (req, res) => {
    try {
        const productsWithImages = await getAllProducts(); // Retrieve products with images
        res.json(productsWithImages);
    } catch (error) {
        res.status(500).send(error.message);
    }
});




router.post('/', upload.array('productImages', 500), async (req, res) => {
    try {
        console.log('Received files:', req.files); // Add this line for logging
        const { name, description, price, category, discountedPrice, quantity, subcategory } = req.body;
        const picturePaths = req.files.map(file => file.path); // Uploaded image paths

        console.log('Picture paths:', picturePaths); // Add this line for logging

        await createProduct(name, description, picturePaths, price, category, subcategory, discountedPrice, quantity);
        res.status(201).send('Product created successfully');
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send(error.message);
    }
});





router.get('/:category', async (req, res) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    try {
        const productsWithImages = await getProductsByCategory(category, page, limit);
        res.json(productsWithImages);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/category/:subcategory', async (req, res) => {
    const { subcategory } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    try {
        const productsWithImages = await getProductsBySubCategory(subcategory, page, limit);
        res.json(productsWithImages);
    } catch (error) {
        res.status(500).send(error.message);
    }
});



router.get('/product/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await getProductById(productId);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.delete('/product/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        await deleteProduct(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:category/search', async (req, res) => {
    const { category } = req.params;
    const { q: searchQuery, page, pageSize } = req.query;

    try {
        const searchResults =  await searchProductsInCategory(searchQuery, category, page, pageSize);
        res.json(searchResults);
    } catch (error) {
        console.error('Error handling category search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/product/:productId', upload.array('productImages', 100), async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const updatedData = req.body;

    try {
        const result = await updateProduct(productId, updatedData, req.files);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});








module.exports= router 