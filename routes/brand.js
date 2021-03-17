const router = require('express').Router();
const moment = require('moment');
const Brand = require('../models/Brand');

router.post('/add', async (req, res) => {
    let data = {
        Name: req.body.Name,
        DateCreated: moment().format(),
        DateUpdated: moment().format(),
    };
    const brand = new Brand({ ...data });
    try {
        // save
        const results = await brand.save();

        if (!results)
            return res.status(400).json({ Message: 'Something went wrong while saving a brand!' });

        // transform
        delete results._doc.__v;
        let savedBrand = { ID: results._id, ...results._doc };
        delete savedBrand['_id'];

        res.send(savedBrand);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get', async (req, res) => {
    try {
        const results = await Brand.find({});

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        let brands = [];
        results.forEach(ii => {
            delete ii._doc.__v;
            brands.push({ ID: ii._id, ...ii._doc });
        });

        brands.forEach(ii => delete ii['_id']);

        return res.status(200).json(brands);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const results = await Brand.findOne({ _id: req.params.id });

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        delete results._doc.__v;
        let brand = { ID: results._id, ...results._doc };
        delete brand['_id'];

        return res.status(200).json(brand);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        let data = req.body;
        data.DateUpdated = moment().format();

        const results = await Brand.findOneAndUpdate({ _id: req.params.id }, data, { new: true });

        if (!results)
            return res.status(204).send('No Content.');

        delete results._doc.__v;
        const updatedBrand = { ID: req.params.id, ...results._doc };
        delete updatedBrand['_id'];

        return res.status(200).json(updatedBrand);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const results = await Brand.deleteOne({ _id: req.params.id });
        if (results.deletedCount > 0) {
            res.status(200).json({ Message: 'Successfully deleted a brand!' });
        }
        else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

module.exports = router;