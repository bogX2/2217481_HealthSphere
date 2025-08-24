import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const BookAppointment = () => {
  const { doctorId } = useParams(); // id del dottore selezionato
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const token = localStorage.getItem('token');

  // 🔹 Recupera slot disponibili del dottore
  const fetchSlots = async () => {
    try {
      const res = await api.get(`/appointments/doctor/${doctorId}/slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlots(res.data.slots.filter(slot => !slot.isBooked) || []);
    } catch (err) {
      console.error('Errore fetch slot:', err);
    }
  };

  useEffect(() => { fetchSlots(); }, [doctorId]);

  // 🔹 Prenota uno slot
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert('Seleziona uno slot!');
    try {
      await api.post('/appointments/book-appointment', { slotId: selectedSlot }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Appuntamento prenotato!');
      fetchSlots(); // aggiorna lista slot
    } catch (err) {
      console.error('Errore prenotazione:', err);
      alert('Errore durante la prenotazione');
    }
  };

  return (
    <div>
      <h2>Prenota un Appuntamento</h2>
      {slots.length === 0 ? (
        <p>Nessuno slot disponibile al momento</p>
      ) : (
        <form onSubmit={handleBook}>
          <label>Seleziona uno slot:</label>
          <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
            <option value="">-- Seleziona --</option>
            {slots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.date} {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>
          <button type="submit">Prenota</button>
        </form>
      )}
    </div>
  );
};

export default BookAppointment;
