import { useState } from 'react';
import api from '../api';

function ConcertList() {
  const [concerts, setConcerts] = useState([]);
  const [country, setCountry] = useState("TR");
  const [city, setCity] = useState("");

  const fetchConcerts = async () => {
    try {
      // Send backend req concert list with country and city params
      const res = await api.get(`/concerts/search?country=${country}&city=${city}`);
      setConcerts(res.data);
    } catch (err) {
      console.error("Fetch Hatası:", err);
    }
  };

  return (
    <div>
      <h2>Find Recent Concerts</h2>
      <select onChange={(e) => setCountry(e.target.value)} value={country}>
        <option value="TR">Türkiye</option>
        <option value="US">USA</option>
        <option value="GB">United Kingdom</option>
      </select>
      
      <input 
        placeholder="city name (e.g. Istanbul)" 
        onChange={(e) => setCity(e.target.value)} 
      />
      <button onClick={fetchConcerts}>Search</button>

      <ul>
        {concerts.map(concert => (
          <li key={concert.id}>
            {concert.name} - {concert.dates.start.localDate}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConcertList;