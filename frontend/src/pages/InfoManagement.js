import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Dropdown from './Dropdown'; // Importa il componente Dropdown

const InfoManagement = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState({
    specialty: "",
    bio: "",
    location: "",
    languages: "",
    fee: "",
    experienceYears: "",
    credentials: { licenseNumber: "", issuedBy: "" },
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  // 🔹 Fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login'); // Reindirizza al login se non c'è il token
      return;
    }

    axios
      .get("http://localhost:8081/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        if (res.data.user.role === 'doctor' && res.data.user.doctor) {
          setDoctorData({
            ...res.data.user.doctor,
            credentials: res.data.user.doctor.credentials[0] || { licenseNumber: '', issuedBy: '' }
          });
        }
      })
      .catch((err) => {
        console.error("Error loading user", err);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]); // Aggiungi navigate come dipendenza per l'effetto

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  //  Funzione di Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChanged')); // Per notificare altri componenti
    navigate('/');
  };

  //  Save/Update doctor profile
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const isUpdate = !!user.doctor;
      const url = isUpdate ? `http://localhost:8082/api/doctors/${user.doctor._id}` : "http://localhost:8082/api/doctors";
      const method = isUpdate ? "put" : "post";

      const payload = {
        userId: user.id,
        ...doctorData,
        credentials: [doctorData.credentials],
        languages: doctorData.languages
    ? doctorData.languages.split(",").map(lang => lang.trim())
    : [],
      };

      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Doctor profile ${isUpdate ? 'updated' : 'created'} successfully!`);
      axios.get("http://localhost:8081/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setUser(res.data.user));

    } catch (err) {
      console.error("Error saving doctor data:", err.response?.data || err);
      alert("Error saving doctor data");
    }
  };

  // 🔹 2. Upload profile photo
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!profilePhoto) return alert("Please select a profile photo.");

    const formData = new FormData();
    formData.append("photo", profilePhoto);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8082/api/doctor/profile-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Profile photo uploaded!");
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      alert("Error uploading profile photo");
    }
  };

  // 🔹 3. Upload documents
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", documentFile);
    formData.append("purpose", "license");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8082/api/doctor/documents", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Document uploaded!");
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Error uploading document");
    }
  };

  return (
    <div className="d-flex flex-column align-items-center vh-100 overflow-y-auto" style={{ backgroundColor: "#e8f7f5", paddingTop: '120px' }}>
      {/* 🔹 Header con il Dropdown Menu */}
      <header className="position-fixed top-0 start-0 w-100 p-4  mb-4 d-flex justify-content-between align-items-center z-1" style={{ userSelect: 'none', backgroundColor: '#e8f7f5' }}>
        <div className="d-flex align-items-center">
          <img src="/logo192.png" alt="HealthSphere Logo" className="rounded-circle me-3" style={{ width: '60px', height: '60px', border: '3px solid #2a9d8f' }} />
          <h1 className="h4 fw-bold text-dark mb-0 d-none d-sm-block">HealthSphere</h1>
        </div>
        <Dropdown onLogout={handleLogout} />
      </header>

      {/* Il resto del contenuto della pagina */}
      <div className={`card shadow-lg p-4 p-md-5 rounded-4 mb-5`} style={{ maxWidth: '800px', width: '100%', borderColor: 'transparent', backgroundColor: '#ffffff' }}>
        <h2 className="text-center mb-4 h3 fw-bold">
          Update Personal Information ({user.role === "doctor" ? "Doctor" : "Patient"})
        </h2>

        {/* PATIENT - Form in a card */}
        {user.role === "patient" && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold">Patient Data</h5>
              <p className="card-text text-muted mb-4">
                Please fill in the fields below to create or update your personal data.
              </p>
              <form>
                <div className="mb-3">
                  <label htmlFor="medicalHistory" className="form-label fw-bold">Medical History</label>
                  <textarea id="medicalHistory" className="form-control rounded-4"></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="insuranceDetails" className="form-label fw-bold">Insurance Details</label>
                  <input type="text" id="insuranceDetails" className="form-control rounded-pill" />
                </div>
                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary btn-lg rounded-pill" style={{ backgroundColor: '#2a9d8f', borderColor: '#2a9d8f' }}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DOCTOR - Sections separated in cards */}
        {user.role === "doctor" && (
          <>
            {/* 1️⃣ Doctor Profile Form */}
            <div className="card shadow-sm mb-4 mt-3">
              <div className="card-body">
                <h5 className="card-title fw-bold">1. Doctor Profile</h5>
                <p className="card-text text-muted mb-4">
                    Please fill in the fields below to create or update your professional profile.
                </p>
                <form onSubmit={handleDoctorSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Specialty</label>
                      <input type="text" value={doctorData.specialty} onChange={(e) => setDoctorData({ ...doctorData, specialty: e.target.value })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Location</label>
                      <input type="text" value={doctorData.location} onChange={(e) => setDoctorData({ ...doctorData, location: e.target.value })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Bio</label>
                      <textarea value={doctorData.bio} onChange={(e) => setDoctorData({ ...doctorData, bio: e.target.value })} className="form-control rounded-4" rows="3"></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Languages (comma separated)</label>
                      <input type="text" value={doctorData.languages} onChange={(e) => setDoctorData({ ...doctorData, languages: e.target.value })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Fee (€)</label>
                      <input type="number" value={doctorData.fee} onChange={(e) => setDoctorData({ ...doctorData, fee: e.target.value })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Years of Experience</label>
                      <input type="number" value={doctorData.experienceYears} onChange={(e) => setDoctorData({ ...doctorData, experienceYears: e.target.value })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">License Number</label>
                      <input type="text" value={doctorData.credentials.licenseNumber} onChange={(e) => setDoctorData({ ...doctorData, credentials: { ...doctorData.credentials, licenseNumber: e.target.value } })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Issued By</label>
                      <input type="text" value={doctorData.credentials.issuedBy} onChange={(e) => setDoctorData({ ...doctorData, credentials: { ...doctorData.credentials, issuedBy: e.target.value } })} className="form-control rounded-pill" />
                    </div>
                    <div className="col-12 mt-4 d-grid">
                      <button type="submit" className="btn btn-primary btn-lg rounded-pill" style={{ backgroundColor: '#2a9d8f', borderColor: '#2a9d8f' }}>Save Profile</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* 2️⃣ Profile Photo Upload */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold">2. Profile Photo</h5>
                <form onSubmit={handlePhotoSubmit} className="row g-3">
                  <div className="col-md-8">
                    <input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files[0])} className="form-control rounded-pill" />
                  </div>
                  <div className="col-md-4 d-grid">
                    <button type="submit" className="btn btn-secondary btn-lg rounded-pill">Upload Photo</button>
                  </div>
                </form>
              </div>
            </div>

            {/* 3️⃣ Document Upload */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title fw-bold">3. Upload Documents</h5>
                <form onSubmit={handleDocumentSubmit} className="row g-3">
                  <div className="col-md-8">
                    <input type="file" onChange={(e) => setDocumentFile(e.target.files[0])} className="form-control rounded-pill" />
                  </div>
                  <div className="col-md-4 d-grid">
                    <button type="submit" className="btn btn-secondary btn-lg rounded-pill">Upload Document</button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoManagement;