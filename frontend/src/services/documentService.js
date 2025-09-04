import api from './api';

const uploadPrescription = (formData) => {
  return api.post('/prescriptions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getPrescriptionsForPatient = (patientId) => {
    return api.get(`/prescriptions/patient/${patientId}`);
};

const downloadPrescription = (prescriptionId) => {
    return api.get(`/prescriptions/download/${prescriptionId}`, {
        responseType: 'blob', // Importante per gestire il download di file
    });
};


const documentService = {
  uploadPrescription,
  getPrescriptionsForPatient,
  downloadPrescription,
};

export default documentService;