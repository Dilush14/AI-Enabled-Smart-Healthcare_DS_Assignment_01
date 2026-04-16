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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service modules
export const UserService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/update', data),
  getAllUsers: () => api.get('/users'),
};

export const DoctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getAvailability: (id) => api.get(`/doctors/${id}/availability`),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  verifyDoctor: (id) => api.put(`/doctors/${id}/verify`),
};

export const AppointmentService = {
  getAppointments: () => api.get('/appointments'),
  bookAppointment: (data) => api.post('/appointments/book', data),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
};

export const PaymentService = {
  processPayment: (paymentData) => api.post('/payments/create', paymentData),
  getPaymentsHistory: () => api.get('/payments/history'),
  verifyPayment: (id) => api.put(`/payments/${id}/verify`),
};

export const TelemedicineService = {
  generateToken: (appointmentId) => api.post(`/telemedicine/token`, { appointmentId }),
};

export const NotificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export default api;
