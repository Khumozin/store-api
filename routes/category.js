const router = require('express').Router();
const moment = require('moment');
const Category = require('../models/Category');

router.post('/add', async (req, res) => {
    let data = {
        Name: req.body.Name,
        DateCreated: moment().format(),
        DateUpdated: moment().format(),
    };
    const category = new Category({ ...data });
    try {
        // save
        const results = await category.save();

        if (!results)
            return res.status(400).json({ Message: 'Something went wrong while saving a category!' });

        // transform
        delete results._doc.__v;
        let savedCategory = { ID: results._id, ...results._doc };
        delete savedCategory['_id'];

        res.send(savedCategory);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get', async (req, res) => {
    try {
        const results = await Category.find({});

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        let categories = [];
        results.forEach(ii => {
            delete ii._doc.__v;
            categories.push({ ID: ii._id, ...ii._doc });
        });

        categories.forEach(ii => delete ii['_id']);

        return res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const results = await Category.findOne({ _id: req.params.id });

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        delete results._doc.__v;
        let category = { ID: results._id, ...results._doc };
        delete category['_id'];

        return res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        let data = req.body;
        data.DateUpdated = moment().format();

        const results = await Category.findOneAndUpdate({ _id: req.params.id }, data, { new: true });

        if (!results)
            return res.status(204).send('No Content.');

        delete results._doc.__v;
        const updatedCategory = { ID: req.params.id, ...results._doc };
        delete updatedCategory['_id'];

        return res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const results = await Category.deleteOne({ _id: req.params.id });
        if (results.deletedCount > 0) {
            res.status(200).json({ Message: 'Successfully deleted a category!' });
        }
        else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

module.exports = router;