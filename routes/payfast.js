const router = require('express').Router();
const { generateSignature, paymentNotification } = require('../helpers/functions');

// Post [Response from PayFast]
router.post('/notify', async (req, res) => {
    try {
        const results = await paymentNotification(req);

        if (!results)
            return res.status(400).json({ Message: 'Something went wrong while making a payment' });

        return res.status(200).json(results);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

// Post [Generate Signature]
router.post('/generatesignature', async (req, res) => {
    try {
        const results = generateSignature(req.body);

        if (!results)
            return res.status(400).json({ Message: 'Something went wrong while generating a signature' });

        return res.status(200).json(results);
    } catch (error) {
        res.status(400).json({ Message: error.message });
    }
});

module.exports = router;