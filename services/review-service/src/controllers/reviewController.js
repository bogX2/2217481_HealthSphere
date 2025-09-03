const Review = require('../models/Review');

// Crea una nuova recensione
exports.createReview = async (req, res) => {
    try {
        const { patientId, doctorId, rating, comment } = req.body;
        const newReview = await Review.create({ patientId, doctorId, rating, comment });
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};

// Ottieni tutte le recensioni per un dottore
exports.getReviewsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const reviews = await Review.findAll({ where: { doctorId } });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};