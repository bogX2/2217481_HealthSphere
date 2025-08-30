// In un nuovo file, ad esempio 'reviewsController.js'

// Funzione per creare una nuova recensione
const createReview = async (req, res) => {
    // L'ID del paziente lo recuperiamo dal token JWT (utente autenticato)
    const patientId = req.user.id; 
    const doctorId = req.params.id;
    const { appointmentId, rating, comment } = req.body;

    // Aggiungi qui la logica per verificare che il paziente abbia effettivamente
    // completato l'appuntamento 'appointmentId' con il 'doctorId'.
    // Questo è un passaggio CRUCIALE per la sicurezza!

    try {
        const newReview = await pool.query(
            `INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [patientId, doctorId, appointmentId, rating, comment]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Errore del server");
    }
};

// Funzione per ottenere le recensioni di un dottore
const getDoctorReviews = async (req, res) => {
    const doctorId = req.params.id;
    try {
        // Query per ottenere le recensioni e anche il nome del paziente che l'ha scritta
        const reviews = await pool.query(
            `SELECT r.rating, r.comment, r.created_at, p.nome, p.cognome 
             FROM reviews r
             JOIN patientprofile p ON r.patient_id = p.userid
             WHERE r.doctor_id = $1
             ORDER BY r.created_at DESC`,
            [doctorId]
        );
        res.status(200).json(reviews.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Errore del server");
    }
};

module.exports = {
    createReview,
    getDoctorReviews
};