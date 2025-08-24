import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const backendURL = 'http://localhost:8083/api/appointments';

  // 🔹 Recupera gli slot del dottore loggato
  const fetchSlots = async () => {
  try {
    const doctorId = localStorage.getItem('userId'); // esempio
    const res = await axios.get(`${backendURL}/slots/doctor/${doctorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Fetch slots response:', res.data);
    setSlots(res.data.slots || []);
  } catch (err) {
    console.error('Errore fetch slot:', err);
    setError('Impossibile recuperare gli slot');
  }
};

  useEffect(() => {
    fetchSlots();
  }, []);

  // 🔹 Crea un nuovo slot
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime) {
      return setError('Compila tutti i campi');
    }

    if (startTime >= endTime) {
      return setError('L\'orario di inizio deve essere precedente a quello di fine');
    }

    try {
      const res = await axios.post(
        `${backendURL}/slots`,
        { date, startTime, endTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Create slot response:', res.data);
      setSlots([...slots, res.data.slot]);
      setDate('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      console.error('Errore creazione slot:', err);
      setError(err.response?.data?.error || 'Errore sconosciuto nella creazione dello slot');
    }
  };

  return (
    <div>
      <h2>Gestisci Slot</h2>

      {error && <div style={{ color: 'red', marginBottom: '1em' }}>{error}</div>}

      <form onSubmit={handleCreateSlot}>
        <label>Data:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <label>Inizio:</label>
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        <label>Fine:</label>
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        <button type="submit">Crea Slot</button>
      </form>

      <h3>Slot disponibili:</h3>
      {slots.length === 0 ? (
        <p>Nessuno slot disponibile</p>
      ) : (
        <ul>
          {slots.map(slot => (
            <li key={slot.id}>
              {slot.date} - {slot.startTime} / {slot.endTime} {slot.isBooked ? '(Prenotato)' : '(Libero)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageSlots;
