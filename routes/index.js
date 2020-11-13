const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const homeController = require('../controllers/home_controller');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.get('/', homeController.home);
router.post('/search', homeController.search);

module.exports = router;