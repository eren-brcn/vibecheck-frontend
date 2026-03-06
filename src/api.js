import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api' // This matches your backend URL
});

export default api;