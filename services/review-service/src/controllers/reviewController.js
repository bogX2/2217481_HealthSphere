const Review = require('../models/Review');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

        if (reviews.length === 0) {
            return res.status(200).json([]);
        }

        const enrichedReviews = await Promise.all(
            reviews.map(async (review) => {
                const reviewData = review.get({ plain: true });
                
                try {
                    // 2. Crea un token di servizio sicuro
                    const serviceToken = jwt.sign(
                        { service: 'review-service', permissions: ['read:user:public'] }, 
                        process.env.INTERNAL_SERVICE_SECRET, // Usa la chiave segreta corretta
                        { expiresIn: '1m' }
                    );

                    // 3. Chiama lo user-service INCLUDENDO il token e con l'URL corretto
                    const userServiceUrl = 'http://user-service:8081';
                    const response = await axios.get(
                        `${userServiceUrl}/api/internal/users/${review.patientId}/public`, // Aggiunto /public
                        { 
                            headers: { 'Authorization': `Bearer ${serviceToken}` } 
                        }
                    );
                    
                    reviewData.patient = response.data; 

                } catch (error) {
                    console.error(`Failed to fetch patient details for ID ${review.patientId}:`, error.response?.data || error.message);
                    reviewData.patient = { firstName: 'Anonymous', lastName: 'User' };
                }
                
                return reviewData;
            })
        );

        res.status(200).json(enrichedReviews);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};