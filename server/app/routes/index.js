'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/user', require('./user'));
router.use('/emails', require("./email"));
router.use('/names', require("./names"));




// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
