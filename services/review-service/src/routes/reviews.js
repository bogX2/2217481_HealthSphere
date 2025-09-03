const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Rotta per creare una nuova recensione
router.post('/', reviewController.createReview);

// Rotta per ottenere le recensioni di un dottore
router.get('/doctor/:doctorId', reviewController.getReviewsByDoctor);

module.exports = router;