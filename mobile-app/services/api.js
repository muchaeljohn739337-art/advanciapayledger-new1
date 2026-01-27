import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://advanciapayledger.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, remove it and redirect to login
      await AsyncStorage.removeItem('authToken');
      // Handle navigation to login screen
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token } = response.data;
    await AsyncStorage.setItem('authToken', token);
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },
};

export const dashboardAPI = {
  getMetrics: async () => {
    const response = await api.get('/api/dashboard/metrics');
    return response.data;
  },
  
  getRevenueData: async () => {
    const response = await api.get('/api/dashboard/revenue');
    return response.data;
  },
  
  getTransactions: async () => {
    const response = await api.get('/api/dashboard/transactions');
    return response.data;
  },
};

export const facilitiesAPI = {
  getFacilities: async () => {
    const response = await api.get('/api/facilities');
    return response.data;
  },
  
  getFacility: async (id) => {
    const response = await api.get(`/api/facilities/${id}`);
    return response.data;
  },
  
  createFacility: async (facilityData) => {
    const response = await api.post('/api/facilities', facilityData);
    return response.data;
  },
  
  updateFacility: async (id, facilityData) => {
    const response = await api.put(`/api/facilities/${id}`, facilityData);
    return response.data;
  },
};

export const paymentsAPI = {
  getPaymentMethods: async () => {
    const response = await api.get('/api/payments/methods');
    return response.data;
  },
  
  processPayment: async (paymentData) => {
    const response = await api.post('/api/payments/process', paymentData);
    return response.data;
  },
  
  getPaymentHistory: async () => {
    const response = await api.get('/api/payments/history');
    return response.data;
  },
};

export const appointmentsAPI = {
  getAppointments: async () => {
    const response = await api.get('/api/appointments');
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/api/appointments/${id}`, appointmentData);
    return response.data;
  },
};

export const bedsAPI = {
  getBedStatus: async () => {
    const response = await api.get('/api/beds/status');
    return response.data;
  },
  
  updateBedStatus: async (id, bedData) => {
    const response = await api.put(`/api/beds/${id}`, bedData);
    return response.data;
  },
};

export default api;
