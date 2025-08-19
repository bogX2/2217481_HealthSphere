// InfoManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/InfoManagement.module.css";

const InfoManagement = () => {
  const [user, setUser] = useState(null);

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

  // 🔹 Recupera utente loggato
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:8081/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error("Errore nel caricamento utente", err));
  }, []);

  if (!user) return <div>Caricamento...</div>;

  // 🔹 1. Salva profilo medico
  const handleDoctorSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");

    const payload = {
    userId: user.id,
    ...doctorData,
    credentials: [doctorData.credentials] // metti in un array
    };
    console.log("Payload inviato:", payload, Array.isArray(payload.credentials));

    const createRes = await axios.post(
      "http://localhost:8082/api/doctors",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Profilo medico creato con successo!");
  } catch (err) {
    console.error("Errore creazione medico:", err.response?.data || err);
  }
};


  // 🔹 2. Carica foto profilo
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!profilePhoto) return alert("Seleziona una foto profilo");

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
      alert("Foto profilo caricata!");
    } catch (err) {
      console.error("Errore upload foto profilo:", err);
    }
  };

  // 🔹 3. Carica documenti
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) return alert("Seleziona un file");

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
      alert("Documento caricato!");
    } catch (err) {
      console.error("Errore upload documento:", err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2>
        Modifica dati personali ({user.role === "doctor" ? "Medico" : "Paziente"})
      </h2>

      {/* PAZIENTE */}
      {user.role === "patient" && (
        <form>
          <h3>Dati Paziente</h3>
          <label>Storia Medica</label>
          <textarea name="medicalHistory" />

          <label>Dettagli Assicurazione</label>
          <input type="text" name="insuranceDetails" />

          <button type="submit">Salva</button>
        </form>
      )}

      {/* MEDICO */}
      {user.role === "doctor" && (
        <>
          {/* 1️⃣ PROFILO MEDICO */}
          <form onSubmit={handleDoctorSubmit}>
            <h3>1. Dati Medico</h3>

            <label>Specializzazione</label>
            <input
              type="text"
              value={doctorData.specialty}
              onChange={(e) =>
                setDoctorData({ ...doctorData, specialty: e.target.value })
              }
            />

            <label>Bio</label>
            <textarea
              value={doctorData.bio}
              onChange={(e) => setDoctorData({ ...doctorData, bio: e.target.value })}
            />

            <label>Location</label>
            <input
              type="text"
              value={doctorData.location}
              onChange={(e) =>
                setDoctorData({ ...doctorData, location: e.target.value })
              }
            />

            <label>Lingue (separate da virgola)</label>
            <input
              type="text"
              value={doctorData.languages}
              onChange={(e) =>
                setDoctorData({ ...doctorData, languages: e.target.value })
              }
            />

            <label>Tariffa (€)</label>
            <input
              type="number"
              value={doctorData.fee}
              onChange={(e) => setDoctorData({ ...doctorData, fee: e.target.value })}
            />

            <label>Anni di Esperienza</label>
            <input
              type="number"
              value={doctorData.experienceYears}
              onChange={(e) =>
                setDoctorData({ ...doctorData, experienceYears: e.target.value })
              }
            />

            <label>Numero Licenza</label>
            <input
              type="text"
              value={doctorData.credentials.licenseNumber}
              onChange={(e) =>
                setDoctorData({
                  ...doctorData,
                  credentials: { ...doctorData.credentials, licenseNumber: e.target.value },
                })
              }
            />

            <label>Ente rilascio</label>
            <input
              type="text"
              value={doctorData.credentials.issuedBy}
              onChange={(e) =>
                setDoctorData({
                  ...doctorData,
                  credentials: { ...doctorData.credentials, issuedBy: e.target.value },
                })
              }
            />

            <button type="submit">Salva Profilo</button>
          </form>

          {/* 2️⃣ FOTO PROFILO */}
          <form onSubmit={handlePhotoSubmit}>
            <h3>2. Foto Profilo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
            />
            <button type="submit">Carica Foto</button>
          </form>

          {/* 3️⃣ DOCUMENTI */}
          <form onSubmit={handleDocumentSubmit}>
            <h3>3. Carica certificati</h3>
            <input
              type="file"
              onChange={(e) => setDocumentFile(e.target.files[0])}
            />
            <button type="submit">Carica Documento</button>
          </form>
        </>
      )}
    </div>
  );
};

export default InfoManagement;
