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
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/doctors/${doctorId}/slots`, { params: { date } }),
  bookAppointment: (data) => api.post('/appointments/book', data),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  updateAppointmentStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
};

export const PaymentService = {
  processPayment: (paymentData) => api.post('/payments/create', paymentData),
  getPaymentsHistory: () => api.get('/payments/history'),
  verifyPayment: (id) => api.put(`/payments/${id}/verify`),
};

export const TelemedicineService = {
  createSession: (data) => api.post('/telemedicine/create-session', data),
  getSession: (id) => api.get(`/telemedicine/session/${id}`),
  getSessionByAppointment: (appointmentId) => api.get(`/telemedicine/session/appointment/${appointmentId}`),
  updateSessionStatus: (id, status) => api.put(`/telemedicine/session/${id}/status`, { status }),
  endSession: (id, notes) => api.put(`/telemedicine/session/${id}/end`, { notes }),
  uploadReport: (formData) => {
    const apiWithFormData = axios.create({
      baseURL: '/api',
      timeout: 30000,
    });
    const token = localStorage.getItem('token');
    if (token) {
      apiWithFormData.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return apiWithFormData.post('/telemedicine/report/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data).catch(err => Promise.reject(err));
  },
  getReports: (sessionId, patientId) => {
    const params = {};
    if (sessionId) params.sessionId = sessionId;
    if (patientId) params.patientId = patientId;
    return api.get('/telemedicine/reports', { params });
  },
  getReportById: (id) => api.get(`/telemedicine/report/${id}`),
  addDoctorNotes: (id, notes, recommendations) => api.put(`/telemedicine/report/${id}/notes`, { notes, recommendations }),
  getSessionReports: (sessionId) => api.get(`/telemedicine/session/${sessionId}/reports`),
  getPatientReports: () => api.get('/telemedicine/patient/reports'),
};

export const NotificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
