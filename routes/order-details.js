const router = require('express').Router();
const moment = require('moment');
const OrderDetails = require('../models/OrderDetails');
const { addOrderDetails } = require('../shared/add-order');

router.post('/add', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ Message: 'Something went wrong while saving order details' });
        }

        const results = await addOrderDetails(req.body);

        if (!results)
            return res.status(400).json({ Message: 'Something went wrong while saving order details' });

        return res.status(200).json(results);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get', async (req, res) => {
    try {
        const results = await OrderDetails.find({});

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        let orderDetails = [];
        results.forEach(ii => {
            delete ii._doc.__v;
            orderDetails.push({ ID: ii._id, ...ii._doc });
        });

        orderDetails.forEach(ii => delete ii['_id']);

        return res.status(200).json(orderDetails);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const results = await OrderDetails.findOne({ _id: req.params.id });

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        delete results._doc.__v;
        let orderDetails = { ID: results._id, ...results._doc };
        delete orderDetails['_id'];

        return res.status(200).json(orderDetails);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.post('/getbyobj', async (req, res) => {
    try {
        const results = await OrderDetails.findOne(req.body);

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        delete results._doc.__v;
        let orderDetails = { ID: results._id, ...results._doc };

        delete orderDetails['_id'];

        res.status(200).json(orderDetails);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.post('/track', async (req, res) => {
    try {
        const results = await OrderDetails.find(req.body);

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        let orders = [];

        results.forEach(ii => {
            delete ii._doc.__v;
            orders.push({ ID: ii._id, ...ii._doc });
        });

        orders.forEach(ii => delete ii['_id']);

        res.status(200).send(orders);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        let data = req.body;
        data.DateUpdated = moment().format();

        const results = await OrderDetails.findOneAndUpdate({ _id: req.params.id },
            {
                IsDelivered: data.IsDelivered,
                payment_status: data.payment_status,
                DateUpdated: moment().format()
            }, { new: true });

        if (!results)
            return res.status(204).send('No Content.');

        delete results._doc.__v;
        const updatedOrderDetails = { ID: req.params.id, ...results._doc };
        delete updatedOrderDetails['_id'];

        return res.status(200).json(updatedOrderDetails);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const results = await OrderDetails.deleteOne({ _id: req.params.id });
        if (results.deletedCount > 0) {
            res.status(200).json({ Message: 'Successfully deleted a order details!' });
        }
        else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

module.exports = router;