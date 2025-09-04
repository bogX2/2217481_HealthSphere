const multer = require('multer');
const path = require('path');
const Prescription = require('../models/Prescription');

// 1. Configurazione di Multer per lo storage dei file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // I file verranno salvati nella cartella 'uploads' che abbiamo creato
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Creiamo un nome unico per il file per evitare sovrascritture
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. Controller per caricare una ricetta
exports.uploadPrescription = async (req, res) => {
    try {
        const { patientId, doctorId, notes } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Nessun file caricato.' });
        }

        // Salva le informazioni del file nel database
        const newPrescription = await Prescription.create({
            patientId,
            doctorId,
            notes,
            fileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
        });

        res.status(201).json({ message: 'Ricetta caricata con successo', prescription: newPrescription });
    } catch (error) {
        console.error('Errore durante il caricamento della ricetta:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

// 3. Controller per ottenere le ricette di un paziente
exports.getPrescriptionsForPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const prescriptions = await Prescription.findAll({ where: { patientId } });
        res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Errore nel recupero delle ricette:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

// 4. Controller per scaricare una singola ricetta
exports.downloadPrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription.findByPk(id);

        if (!prescription) {
            return res.status(404).json({ message: 'Ricetta non trovata.' });
        }

        // Invia il file per il download
        res.download(prescription.filePath, prescription.fileName);
    } catch (error) {
        console.error('Errore durante il download:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
};

// Esportiamo 'upload' per usarlo come middleware nelle rotte
exports.uploadMiddleware = upload.single('prescription'); // 'prescription' è il nome del campo nel form