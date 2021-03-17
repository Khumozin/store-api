const router = require('express').Router();
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Product = require('../models/Product');

router.post('/add', async (req, res) => {
    try {
        let product = req.body;
        if (!product)
            return undefined;

        product.DateCreated = moment().format();
        product.DateUpdated = moment().format();

        // handle multiple images
        let imagesPath = '';
        const images = product.ProductImages;
        images.forEach((ii, index) => {
            const x = index + 1;
            const imageData = ii.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(imageData, 'base64');
            const imagePath = `uploads/${uuidv4()}_${x}.jpg`;
            fs.writeFile(imagePath, buffer, () => { });

            imagesPath === '' ? imagesPath = imagePath : imagesPath += '|' + imagePath;

        });

        let dto = { ...product, ImagePaths: imagesPath };

        // save
        const productToSave = new Product(dto);
        const response = await productToSave.save();

        if (!response)
            return res.status(400).json({ Message: 'Something went wrong while saving product' });

        delete response._doc.__v;
        let savedProduct = { ID: response._id, ...response._doc };
        delete savedProduct['_id'];

        return res.status(200).json(savedProduct);
    } catch (error) {
        res.status(400).json({ Message: error });
    }
});

router.get('/get', async (req, res) => {
    try {
        const results = await Product.find({});
        let products = [];

        results.forEach(ii => {
            delete ii._doc.__v;
            products.push({ ID: ii._id, ...ii._doc });
        });
        products.forEach(ii => delete ii['_id']);

        res.status(200).send(products);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const results = await Product.findOne({ _id: req.params.id });

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        delete results._doc.__v;
        let product = { ID: results._id, ...results._doc };
        delete product['_id'];

        res.status(200).send(product);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/getByCategoryID/:id', async (req, res) => {
    try {
        const params = req.params.id;
        const paramsArr = params.split(',');

        const results = await Product.find(
            {
                SubCategoryID: paramsArr[0],
                MainCategoryID: paramsArr[1]
            });

        let products = [];

        results.forEach(ii => {
            delete ii._doc.__v;
            products.push({ ID: ii._id, ...ii._doc });
        });

        products.forEach(ii => delete ii['_id']);

        return res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/getByBrandID/:id', async (req, res) => {
    try {
        const results = await await Product.find({ BrandID: req.params.id });
        let products = [];

        results.forEach(ii => {
            delete ii._doc.__v;
            products.push({ ID: ii._id, ...ii._doc });
        });

        products.forEach(ii => delete ii['_id']);

        return res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/getProductsByIDs/:id', async (req, res) => {
    try {
        const ids = req.params.id;
        const idsArray = ids.split(',');
        const results = await Product.find({ _id: { $in: idsArray } });
        let products = [];

        results.forEach(ii => {
            delete ii._doc.__v;
            products.push({ ID: ii._id, ...ii._doc });
        });

        products.forEach(ii => delete ii['_id']);;

        return res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        let product = req.body;
        // get product from DB
        const p = await Product.findOne({ _id: req.params.id });
        if (!p) {
            return res.status(204).send('No Content.');
        }

        let imagesPath = '';

        // handle images
        if (product.ProductImages.length > 0) {

            // delete existing images
            const paths = product.ImagePaths.split('|');

            paths.forEach(p => {
                fs.unlink(p, () => { });
            });

            const images = product.ProductImages;
            images.forEach((ii, index) => {
                const x = index + 1;
                const imageData = ii.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(imageData, 'base64');
                const imagePath = `uploads/${uuidv4()}_${x}.jpg`;
                fs.writeFile(imagePath, buffer, () => { });

                imagesPath === '' ? imagesPath = imagePath : imagesPath += '|' + imagePath;

            });
        } else {
            imagesPath = product.ImagePaths;
        }

        product.DateUpdated = moment().format();
        let dto = { ...product, ImagePaths: imagesPath };

        const results = await Product.findOneAndUpdate({ _id: req.params.id }, dto, { new: true });

        if (!results) return undefined;

        delete results._doc.__v;
        const data = { ID: req.params.id, ...results._doc };
        delete data['_id'];

        if (!results)
            return res.status(204).send('No Content.');

        return res.status(200).json(results);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const results = await Product.findById(req.params.id);

        if (!results)
            return res.status(204).send();;

        delete results._doc.__v;
        let product = { ID: results._id, ...results._doc };
        delete product['_id'];

        if (product) {
            const paths = product.ImagePaths.split('|');

            paths.forEach(p => {
                fs.unlink(p, () => { });
            });
        }

        const response = await Product.deleteOne({ _id: req.params.id });

        if (response.deletedCount > 0) {
            res.status(200).json({ Message: 'Successfully deleted a product!' });
        }
        else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

module.exports = router;
