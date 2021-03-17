const router = require('express').Router();
const moment = require('moment');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

const Roles = {
    Admin: 0,
    Customer: 1,
    SuperUser: 2
};

router.get('/get', async (req, res) => {
    try {
        const results = await User.find({});

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        let users = [];
        results.forEach(ii => {
            delete ii._doc.__v;
            users.push({ ID: ii._id, ...ii._doc });
        });

        users.forEach(ii => {
            delete ii['_id'];
            delete ii.Password;
            delete ii.ResetPasswordLink;
        });

        return res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const results = await User.findOne({ _id: req.params.id });

        if (!results)
            return res.status(204).send({ Message: 'No Content.' });

        delete results._doc.__v;
        let user = { ID: results._id, ...results._doc };
        delete user['_id'];
        delete user.Password;
        delete user.ResetPasswordLink;

        return res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        if (!req.body) {
            res.status(400).json({ Message: 'Invalid user!' });
        }

        const user = req.body;

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(user.Password, salt);

        user.Password = hashedPassword;
        user.Role = Roles.Admin;
        user.EmailAddress = user.EmailAddress.toLowerCase();
        user.DateUpdated = moment().format();
        user.IsActivated = true;

        const results = await User.findOneAndUpdate({ _id: req.params.id }, user, { new: true });

        if (!results)
            return res.status(204).send('No Content.');

        delete results._doc.__v;

        const updateUser = {
            ID: results._id,
            ...results._doc
        };

        delete updateUser.Password;
        delete updateUser.ResetPasswordLink;
        delete updateUser['_id'];

        return res.status(200).json(updateUser);

    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        let _user;
        if (!user) {
            return res.status(204).send();
        } else {
            delete user._doc.__v;
            _user = { ID: user._id, ...user._doc };

            if (user.EmailAddress.includes('admin@')) {
                return res.status(405).json({ Message: 'Cannot delete user!' });
            }
        }

        const results = await User.deleteOne({ _id: req.params.id });
        if (results.deletedCount > 0) {
            res.status(200).json({ Message: 'Successfully deleted a user!' });
        }
        else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

module.exports = router;