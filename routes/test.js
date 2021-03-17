const router = require('express').Router();

router.get('/', async (req, res) => {
    res.send('API is working...');
});


module.exports = router;