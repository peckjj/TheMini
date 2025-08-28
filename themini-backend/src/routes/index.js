const express = require('express');
const router = express.Router();

// Example placeholder route
router.get('/hello', (req, res) => {
    res.json({ message: 'Hello from TheMini API!' });
});

module.exports = router;
