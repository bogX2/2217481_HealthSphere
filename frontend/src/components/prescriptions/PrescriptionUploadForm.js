import React, { useState } from 'react';
import documentService from '../../services/documentService';

const PrescriptionUploadForm = ({ patientId, doctorId }) => {
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Per favore, seleziona un file.');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('prescription', file);
        formData.append('patientId', patientId);
        formData.append('doctorId', doctorId);
        formData.append('notes', notes);

        try {
            await documentService.uploadPrescription(formData);
            setSuccess('Ricetta caricata con successo!');
            setFile(null);
            setNotes('');
            e.target.reset();
        } catch (err) {
            setError('Errore durante il caricamento. Riprova.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="card mt-4">
            <div className="card-body">
                <h5 className="card-title">Carica Ricetta</h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="prescriptionFile" className="form-label">File Ricetta</label>
                        <input className="form-control" type="file" id="prescriptionFile" onChange={handleFileChange} disabled={isUploading} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="notes" className="form-label">Note Aggiuntive</label>
                        <textarea 
                            className="form-control" 
                            id="notes" 
                            rows="2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isUploading}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-success" disabled={isUploading}>
                        {isUploading ? 'Caricamento...' : 'Carica'}
                    </button>
                    {error && <div className="alert alert-danger mt-2">{error}</div>}
                    {success && <div className="alert alert-success mt-2">{success}</div>}
                </form>
            </div>
        </div>
    );
};

export default PrescriptionUploadForm;