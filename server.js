const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const brandRoutes = require('./routes/brand');
const categoryRoutes = require('./routes/category');
const orderDetailsRoutes = require('./routes/order-details');
const payfastRoutes = require('./routes/payfast');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');

const app = express();
dotenv.config();

// Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('Connected to DB')
);

// Middlewares
corsOptions = {
    // origin: 'https://ngrx-brands.web.app/',
    // origin: 'https://onlinestoreapp-a2a76.web.app',
    // origin: 'https://onlinestoreapp.azurewebsites.net',
    // origin: 'http://localhost:4200',
    origin: "*",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// handle static files
app.use('/uploads', express.static('./uploads'));

// Route Middlewares
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orderdetails', orderDetailsRoutes);
app.use('/api/payment', payfastRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.listen(process.env.PORT, () => console.log(`Listening on port 3000`));