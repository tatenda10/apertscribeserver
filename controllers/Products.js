const fs = require('fs')
const path = require('path');
const db = require('../db/db'); // Replace this with the correct path to your db connection
const { unlink } = require('fs').promises;
const crypto = require('crypto');
require('dotenv').config();



const { Paynow } = require('paynow'); // Install the Paynow library

// Replace with your actual integration details
const paynowIntegrationId = process.env.paynowIntegrationId;
const paynowIntegrationKey = process.env.paynowIntegrationKey;

// Create an instance of Paynow
const paynow = new Paynow(paynowIntegrationId, paynowIntegrationKey);

// Set result and return URLs
paynow.resultUrl = process.env.resultUrl;
paynow.returnUrl = process.env.returnUrl;

const getAllProducts = async () => {
    try {
        const products = await db.query('SELECT * FROM Products ORDER BY RAND() LIMIT 10');
        const updatedProducts = products[0].map(product => {
            // Check if picture_path exists and is a JSON string before updating it
            if (typeof product.picture_path === 'string') {
                try {
                    const imagePathArray = JSON.parse(product.picture_path);
                    // Assuming imagePathArray is an array of image paths
                    if (Array.isArray(imagePathArray)) {
                        product.picture_path = imagePathArray.map(imagePath => ({
                            picture_path: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                        }));
                    }
                } catch (parseError) {
                    console.error('Error parsing picture_path JSON:', parseError);
                }
            } else if (Array.isArray(product.picture_path)) {
                // If picture_path is already an array of image paths
                product.picture_path = product.picture_path.map(imagePath => ({
                    updated: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                }));
            }

            return product;
        });

        return updatedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('An error occurred while fetching products');
    }
};






const createProduct = async (name, description, picturePaths, price, category, subcategory, discountedPrice, quantity) => {
    try {
        // Save product details along with the image paths in the database
        const connection = await db.getConnection();

        // Convert picturePaths to a JSON string for storage in the database
        const picturePathsJson = JSON.stringify(picturePaths);

        const query = 'INSERT INTO Products (name, description, picture_path, price, category, subcategory, discounted_price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [name, description, picturePathsJson, price, category, subcategory, discountedPrice, quantity];
        const [result] = await connection.query(query, values);
        connection.release();

        return result;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('An error occurred while creating the product');
    }
};







const getProductsByCategory = async (category, page = 1, pageSize = 8) => {
    try {
        const offset = (page - 1) * pageSize;
        const query = 'SELECT * FROM Products WHERE category = ? ORDER BY product_id DESC LIMIT ? OFFSET ?';
        const products = await db.query(query, [category, pageSize, offset]);

        if (!products || !products[0]) {
            console.error('Error fetching products by category: Products not found');
            return [];
        }

        const updatedProducts = products[0].map(product => {
            if (typeof product.picture_path === 'string') {
                try {
                    const imagePathArray = JSON.parse(product.picture_path);
                    if (Array.isArray(imagePathArray)) {
                        product.picture_path = imagePathArray.map(imagePath => ({
                            picture_path: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                        }));
                    }
                } catch (parseError) {
                    console.error('Error parsing picture_path JSON:', parseError);
                }

            } else if (Array.isArray(product.picture_path)) {
                // If picture_path is already an array of image paths
                product.picture_path = product.picture_path.map(imagePath => ({
                    updated: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                }));
            }

            if (!product.picture_path) {
                console.error('Product picture_path is null or undefined:', product);
            }

            return product;
        });

        return updatedProducts;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw new Error('An error occurred while fetching products by category');
    }
};


// Modify your getProductsBySubCategory function
const getProductsBySubCategory = async (subcategory, page = 1, pageSize = 8) => {
    try {
        const offset = (page - 1) * pageSize;
        const query = 'SELECT * FROM Products WHERE subcategory = ? ORDER BY product_id DESC LIMIT ? OFFSET ?';
        const products = await db.query(query, [subcategory, pageSize, offset]);

        if (!products || !products[0]) {
            console.error('Error fetching products by subcategory: Products not found');
            return [];
        }

        const updatedProducts = products[0].map(product => {
            if (typeof product.picture_path === 'string') {
                try {
                    const imagePathArray = JSON.parse(product.picture_path);
                    if (Array.isArray(imagePathArray)) {
                        product.picture_path = imagePathArray.map(imagePath => ({
                            picture_path: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                        }));
                    }
                } catch (parseError) {
                    console.error('Error parsing picture_path JSON:', parseError);
                }
            } else if (Array.isArray(product.picture_path)) {
                product.picture_path = product.picture_path.map(imagePath => ({
                    updated: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                }));
            }

            if (!product.picture_path) {
                console.error('Product picture_path is null or undefined:', product);
            }

            return product;
        });

        return updatedProducts;
    } catch (error) {
        console.error('Error fetching products by subcategory:', error);
        throw new Error('An error occurred while fetching products by subcategory');
    }
};





const getProductById = async (productId) => {
    try {
        const product = await db.query('SELECT * FROM Products WHERE product_id = ?', [productId]);
        if (product[0].length === 0) {
            throw new Error('Product not found');
        }

        const singleProduct = {
            ...product[0][0],
        };

        if (typeof singleProduct.picture_path === 'string') {
            try {
                const imagePathArray = JSON.parse(singleProduct.picture_path);
                if (Array.isArray(imagePathArray)) {
                    singleProduct.picture_path = imagePathArray.map(imagePath => ({
                        original: imagePath,
                        updated: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
                    }));
                }
            } catch (parseError) {
                console.error('Error parsing picture_path JSON:', parseError);
            }
            
        }
        
        


        if (!singleProduct.picture_path) {
            console.error('Product picture_path is null or undefined:', singleProduct);
        } else if (typeof singleProduct.picture_path === 'string') {
            singleProduct.picture_path = `${process.env.BASE_URL}/${singleProduct.picture_path.replace(/\\/g, '/')}`;
        } else if (Array.isArray(singleProduct.picture_path)) {
            singleProduct.picture_path = singleProduct.picture_path.map(imagePath => ({

                picture_path: `${process.env.BASE_URL}/${imagePath.replace(/\\/g, '/')}`
            }));
        }

        

        return singleProduct;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        throw new Error('An error occurred while fetching product by ID');
    }
};



const createOrder = async (
    customer_name,
    address,
    email,
    phone_number,
    amount_paid,
    order_items,
    transaction_date,
    Delivery_date,
    paynowReference,
    pollUrl
) => {
    try {
        // Assuming you have a database connection (e.g., using the `db` object)
        const connection = await db.getConnection();

        // Insert order details into the database
        const insertQuery =
            'INSERT INTO orders (customer_name, address, email, phone_number, amount_paid, order_items, transaction_date, Delivery_date, paynow_reference, poll_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const insertValues = [
            customer_name,
            address,
            email,
            phone_number,
            amount_paid,
            JSON.stringify(order_items), // Assuming order_items is an array of objects
            transaction_date,
            Delivery_date,
            paynowReference,
            pollUrl,
        ];

        const [result] = await connection.query(insertQuery, insertValues);

        // Release the database connection
        connection.release();

        return result;
    } catch (error) {
        console.error('Error creating order in the database:', error);
        throw new Error('An error occurred while creating the order');
    }
};

const updateOrderStatusById = async (orderId, status) => {
    const query = 'UPDATE orders SET paynowStatus = ? WHERE order_id = ?';
    const values = [status, orderId];

    try {
        // Get a connection from the pool
        const connection = await db.getConnection();

        // Execute the update query
        await connection.query(query, values);

        // Release the connection back to the pool
        connection.release();

        console.log(`Order status updated to: ${status}`);
    } catch (error) {
        console.error('Error updating order status in the database:', error);
        throw error; // Rethrow the error to handle it in the calling function if needed
    }
};


const deleteProduct = async (productId) => {
    try {
        // Check if the product exists before attempting to delete
        const existingProduct = await db.query('SELECT * FROM Products WHERE product_id = ?', [productId]);

        if (existingProduct[0].length === 0) {
            throw new Error('Product not found');
        }

        // Get the picture_path of the product
        const picturePaths = existingProduct[0][0].picture_path;

        // Delete each image file if they exist
        if (picturePaths) {
            try {
                let imagePathArray;

                // Check if picturePaths is a valid JSON string
                if (typeof picturePaths === 'string') {
                    imagePathArray = JSON.parse(picturePaths);
                } else {
                    imagePathArray = picturePaths;
                }

                if (Array.isArray(imagePathArray) && imagePathArray.length > 0) {
                    // Before the unlink operations
                    console.log('Deleting images:', imagePathArray);

                    await Promise.all(imagePathArray.map(async (imagePath) => {
                        await fs.promises.unlink(imagePath);
                    }));
                }
            } catch (imageError) {
                console.error('Error deleting images:', imageError.message);
                throw new Error('An error occurred while deleting the images');
            }
        }

        // Delete the product from the database
        const connection = await db.getConnection();
        const deleteQuery = 'DELETE FROM Products WHERE product_id = ?';
        const deleteValues = [productId];
        await connection.query(deleteQuery, deleteValues);
        connection.release();

        return { message: 'Product deleted successfully' };
    } catch (error) {
        console.error('Error deleting product:', error.message);
        throw new Error('An error occurred while deleting the product');
    }
};



const updateProduct = async (productId, updatedData, productImages) => {
    try {
        const {
            name,
            description,
            category,
            subcategory,
            quantity,
            price,
            discounted_price: discountedPrice, // Add discounted_price to updatedData
        } = updatedData;

        // Fetch the existing product to get the previous image paths and other details
        const [existingProduct] = await db.query(
            'SELECT * FROM Products WHERE product_id = ?',
            [productId]
        );

        if (!existingProduct || existingProduct.length === 0) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        // Extract existing details
        const {
            picture_path: existingImagePaths = [],
            quantity: existingQuantity,
            price: existingPrice,
            discounted_price: existingDiscountedPrice,
        } = existingProduct[0];

        // Use the existing quantity if not provided in the updated data
        const updatedQuantity =
            quantity !== undefined ? quantity : existingQuantity;

        // Use the existing price if not provided in the updated data
        const updatedPrice = price !== undefined ? price : existingPrice;

        // Use the existing discounted_price if not provided in the updated data
        const updatedDiscountedPrice =
            discountedPrice !== undefined
                ? discountedPrice
                : existingDiscountedPrice;

        // Check if images are uploaded
        let newPicturePaths = [];
        if (productImages && productImages.length > 0) {
            // Use the filenames generated by Multer
            newPicturePaths = productImages.map((image) =>
                image.path.replace(/\\/g, '/')
            );
        } else {
            // If no new images are rendered, use the existing image paths
            newPicturePaths = existingImagePaths;
        }

        // Remove existing images from the folder and database if new images are added
        if (newPicturePaths.length > 0) {
            for (const imagePath of existingImagePaths) {
                // Check if the image path is not present in the updated image paths
                if (!newPicturePaths.includes(imagePath)) {
                    try {
                        // Delete the image from the folder using the full URL
                        const fullImagePath = path.join(
                            __dirname,
                            '..',
                            'public',
                            imagePath
                        );
                        await fs.promises.unlink(fullImagePath);
                    } catch (error) {
                        console.error(`Error deleting file ${imagePath}:`, error);
                    }
                }
            }
        }

        // Combine existing and new image paths
        const updatedImagePaths = newPicturePaths;

        // Update query
        const query = `
            UPDATE Products 
            SET 
                name = ?,
                description = ?,
                picture_path = ?,
                category = ?,
                subcategory = ?,
                quantity = ?,
                price = ?,
                discounted_price = ?  -- Add discounted_price in the update
            WHERE product_id = ?`;

        // Execute the query
        const [result] = await db.query(query, [
            name,
            description,
            JSON.stringify(updatedImagePaths),
            category,
            subcategory,
            updatedQuantity,
            updatedPrice,
            updatedDiscountedPrice, // Include discounted_price in the query
            productId,
        ]);

        // Log the result for debugging
        console.log('Update Result:', result);

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        console.log('Product updated successfully');

        return { message: 'Product updated successfully' };
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error('An error occurred while updating the product');
    }
};











const getAllOrders = async (page = 1, pageSize = 8) => {
    try {
        const offset = (page - 1) * pageSize;
        const query = 'SELECT * FROM orders ORDER BY order_id DESC LIMIT ? OFFSET ?';
        const orders = await db.query(query, [pageSize, offset]);

        // New pollPaymentStatus function
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

        // Initiate payment status polling for each order
        for (const order of orders[0]) {
            order.paymentStatus = await pollPaymentStatus(order.poll_url, order.order_id);
            console.log(order.paymentStatus)
        }

        return orders[0];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('An error occurred while fetching orders');
    }
};



async function getOrderById(orderId) {
    try {
        const order = await db.query(`SELECT * FROM orders WHERE order_id = ?`, [orderId]);

        if (order && order.length > 0) {
            return order[0];
        } else {
            throw new Error("Order not found");
        }
    } catch (error) {
        throw error;
    }
}

const isValidDiscountPercentage = (discountPercentage) => {
    return !isNaN(discountPercentage) && discountPercentage >= 0 && discountPercentage <= 100;
};


const updateDiscountForAllProducts = async (discountPercentage) => {
    try {
        let promotionStatus = false;

        if (discountPercentage === null) {
            // If discountPercentage is null, cancel the discount
            const [rows] = await db.execute(
                'UPDATE Products SET price = discounted_price WHERE discounted_price IS NOT NULL'
            );

            if (rows.affectedRows > 0) {
                promotionStatus = false;
            } else {
                throw new Error('No products found');
            }
        } else if (isValidDiscountPercentage(discountPercentage)) {
            // Update the discount_price for all products based on the discount percentage
            const [rows] = await db.execute(
                'UPDATE Products SET discounted_price = price, price = price * ? / 100',
                [100 - discountPercentage]
            );

            if (rows.affectedRows > 0) {
                promotionStatus = true;
            } else {
                throw new Error('No products found');
            }
        } else {
            throw new Error('Invalid discount percentage');
        }

        // Update promotion status
        await updatePromotionStatus(promotionStatus);

        return { message: `Discount ${promotionStatus ? 'applied' : 'canceled'} for all products` };
    } catch (error) {
        console.error('Error updating discount for all products:', error);
        throw error;
    }
};

const updatePromotionStatus = async (isPromotionActive) => {
    try {
        // Update the promotion status in the database
        const query = 'UPDATE Products SET promotion_status = ? '; // Use the correct column name
        await db.execute(query, [isPromotionActive]);
    } catch (error) {
        console.error('Error updating promotion status:', error);
        throw error;
    }
};


const getPromotionStatus = async (req, res) => {
    try {
      const [rows] = await db.query('SELECT promotion_status FROM Products ORDER BY RAND() LIMIT 1');
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Promotion status not found' });
      }
  
      const promotionStatus = rows[0].promotion_status;
      res.status(200).json({ promotionStatus });
    } catch (error) {
      console.error('Error fetching promotion status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  



const searchProductsInCategory = async (searchQuery, category, page = 1, pageSize = 8) => {
    try {
        const offset = (page - 1) * pageSize;
        const query = `
            SELECT * FROM Products 
            WHERE category = ? AND (name LIKE ? OR name LIKE ? OR description LIKE ?) 
            ORDER BY product_id DESC 
            LIMIT ? OFFSET ?`;

        const products = await db.query(query, [
            category,
            `%${searchQuery}%`,
            `${searchQuery}%`,
            `%${searchQuery}%`,
            pageSize,
            offset
        ]);

        if (!products || !products[0]) {
            console.error('Error fetching products by search query and category: Products not found');
            return [];
        }

        const updatedProducts = products[0].map(product => {
            const picturePaths = Array.isArray(product.picture_path)
                ? product.picture_path.map(path => ({
                    picture_path: `${process.env.BASE_URL}/${path.replace(/\\/g, '/')}`
                }))
                : [{ picture_path: `${process.env.BASE_URL}/${(product.picture_path || '').replace(/\\/g, '/')}` }];

            return {
                ...product,
                picture_path: picturePaths,
            };
        });

        return updatedProducts;

    } catch (error) {
        console.error('Error searching products by category:', error);
        throw new Error('An error occurred while searching products by category');
    }
};










module.exports = { getPromotionStatus, updatePromotionStatus, searchProductsInCategory, getProductsBySubCategory, updateDiscountForAllProducts, updateOrderStatusById, getOrderById, getAllOrders, updateProduct, deleteProduct, getAllProducts, createProduct, getProductById, getProductsByCategory, createOrder };
