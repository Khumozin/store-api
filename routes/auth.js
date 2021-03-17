const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const Roles = {
    Admin: 0,
    Customer: 1,
    SuperUser: 2
};

router.post('/register', async (req, res) => {
    try {
        const exists = await userExists(req.body.EmailAddress);

        if (exists)
            return res.status(400).json({ Message: 'Email already exists!' });

        if (exists === undefined)
            return res.status(400).json({ Message: 'Email is invalid!' });


        if (!req.body)
            return res.status(400).json({ Message: 'Email is invalid!' });

        // Hash password
        let data = { ...req.body };
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(data.Password, salt);

        data.Password = hashedPassword;
        data.Role = Roles.Admin;
        data.EmailAddress = data.EmailAddress.toLowerCase();
        data.DateCreated = moment().format();
        data.DateUpdated = moment().format();
        data.IsActivated = true;

        const user = new User(data);
        const results = await user.save();

        delete results._doc.__v;
        const savedUser = {
            ID: results._id,
            ...results._doc
        };

        delete savedUser.Password;
        delete savedUser.ResetPasswordLink;
        delete savedUser['_id'];

        if (!savedUser)
            return res.status(400).json({ Message: 'Something went wrong while saving user!' });

        return res.status(200).json(savedUser);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

router.post('/login', async (req, res) => {

    try {
        const { EmailAddress, Password } = req.body;

        if (!EmailAddress || !Password)
            return res.status(400).send({ Message: 'Incorrect email or password!' });

        const user = await User.findOne({ EmailAddress: EmailAddress.toLowerCase() });

        if (!user)
            return res.status(400).send({ Message: 'Incorrect email or password!' });

        // Verify password
        const isPasswordValid = await bcryptjs.compare(Password, user.Password);
        if (!isPasswordValid)
            return res.status(400).send({ Message: 'Incorrect email or password!' });

        // read private key
        const RSA_PRIVATE_KEY = fs.readFileSync('./utils/private.key');

        // create and assign token
        const token = jwt.sign(
            {
                ID: user._id,
                Role: user.Role,
                IsActivated: user.IsActivated
            },
            RSA_PRIVATE_KEY,
            {
                expiresIn: 3600, // 60 = 1min / 120 = 2min / 3600 = 1hr
                algorithm: "RS256"
            }
        );

        res.header('Authorization', token).json({ 'authToken': token });
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

async function userExists(emailAddress) {
    if (!emailAddress)
        return undefined;

    const email = emailAddress.toLowerCase();
    const exists = await User.findOne({ EmailAddress: email });

    return exists ? true : false;
}

module.exports = router;