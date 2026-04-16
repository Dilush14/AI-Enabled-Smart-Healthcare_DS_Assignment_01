import axios from 'axios';

// Configure Axios instance
const api = axios.create({
  baseURL: '/api', // Proxy or actual backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle global errors (e.g. 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service modules
export const UserService = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const DoctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
};

export const AppointmentService = {
  getAppointments: () => api.get('/appointments'),
  bookAppointment: (data) => api.post('/appointments', data),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
};

export const PaymentService = {
  processPayment: (paymentData) => api.post('/payments/process', paymentData),
};

export const TelemedicineService = {
  generateToken: (appointmentId) => api.post(`/telemedicine/token`, { appointmentId }),
};

export const NotificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
