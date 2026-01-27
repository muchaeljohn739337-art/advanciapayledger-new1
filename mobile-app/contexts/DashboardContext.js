import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import StorageService from '../services/storage';

// Initial state
const initialState = {
  metrics: null,
  revenueData: null,
  transactions: [],
  facilities: [],
  appointments: [],
  bedStatus: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Action types
const DASHBOARD_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_METRICS: 'SET_METRICS',
  SET_REVENUE_DATA: 'SET_REVENUE_DATA',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_FACILITIES: 'SET_FACILITIES',
  SET_APPOINTMENTS: 'SET_APPOINTMENTS',
  SET_BED_STATUS: 'SET_BED_STATUS',
  UPDATE_METRIC: 'UPDATE_METRIC',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_FACILITY: 'UPDATE_FACILITY',
  REFRESH_DATA: 'REFRESH_DATA',
};

// Reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case DASHBOARD_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case DASHBOARD_ACTIONS.SET_METRICS:
      return {
        ...state,
        metrics: action.payload,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      };

    case DASHBOARD_ACTIONS.SET_REVENUE_DATA:
      return {
        ...state,
        revenueData: action.payload,
        isLoading: false,
      };

    case DASHBOARD_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        isLoading: false,
      };

    case DASHBOARD_ACTIONS.SET_FACILITIES:
      return {
        ...state,
        facilities: action.payload,
        isLoading: false,
      };

    case DASHBOARD_ACTIONS.SET_APPOINTMENTS:
      return {
        ...state,
        appointments: action.payload,
        isLoading: false,
      };

    case DASHBOARD_ACTIONS.SET_BED_STATUS:
      return {
        ...state,
        bedStatus: action.payload,
        isLoading: false,
      };

    case DASHBOARD_ACTIONS.UPDATE_METRIC:
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...action.payload,
        },
      };

    case DASHBOARD_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case DASHBOARD_ACTIONS.UPDATE_FACILITY:
      return {
        ...state,
        facilities: state.facilities.map(facility =>
          facility.id === action.payload.id
            ? { ...facility, ...action.payload }
            : facility
        ),
      };

    case DASHBOARD_ACTIONS.REFRESH_DATA:
      return {
        ...state,
        lastUpdated: new Date().toISOString(),
      };

    default:
      return state;
  }
};

// Create context
const DashboardContext = createContext();

// Provider component
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: true });
      
      // Try to load from cache first
      const cachedData = await StorageService.getDashboardData();
      if (cachedData && isDataFresh(cachedData.lastUpdated)) {
        dispatch({ type: DASHBOARD_ACTIONS.SET_METRICS, payload: cachedData.metrics });
        dispatch({ type: DASHBOARD_ACTIONS.SET_REVENUE_DATA, payload: cachedData.revenueData });
        dispatch({ type: DASHBOARD_ACTIONS.SET_TRANSACTIONS, payload: cachedData.transactions });
        dispatch({ type: DASHBOARD_ACTIONS.SET_FACILITIES, payload: cachedData.facilities });
      }
      
      // Fetch fresh data from API
      const [metrics, revenueData, transactions, facilities] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getRevenueData(),
        dashboardAPI.getTransactions(),
        dashboardAPI.getFacilities(),
      ]);
      
      // Update state
      dispatch({ type: DASHBOARD_ACTIONS.SET_METRICS, payload: metrics });
      dispatch({ type: DASHBOARD_ACTIONS.SET_REVENUE_DATA, payload: revenueData });
      dispatch({ type: DASHBOARD_ACTIONS.SET_TRANSACTIONS, payload: transactions });
      dispatch({ type: DASHBOARD_ACTIONS.SET_FACILITIES, payload: facilities });
      
      // Cache the data
      const dashboardData = {
        metrics,
        revenueData,
        transactions,
        facilities,
        lastUpdated: new Date().toISOString(),
      };
      await StorageService.setDashboardData(dashboardData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      dispatch({
        type: DASHBOARD_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to load dashboard data',
      });
    }
  };

  // Check if data is fresh (less than 5 minutes old)
  const isDataFresh = (lastUpdated) => {
    if (!lastUpdated) return false;
    const now = new Date();
    const lastUpdate = new Date(lastUpdated);
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);
    return diffInMinutes < 5;
  };

  // Refresh specific data
  const refreshMetrics = async () => {
    try {
      const metrics = await dashboardAPI.getMetrics();
      dispatch({ type: DASHBOARD_ACTIONS.SET_METRICS, payload: metrics });
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    }
  };

  const refreshTransactions = async () => {
    try {
      const transactions = await dashboardAPI.getTransactions();
      dispatch({ type: DASHBOARD_ACTIONS.SET_TRANSACTIONS, payload: transactions });
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const refreshFacilities = async () => {
    try {
      const facilities = await dashboardAPI.getFacilities();
      dispatch({ type: DASHBOARD_ACTIONS.SET_FACILITIES, payload: facilities });
    } catch (error) {
      console.error('Error refreshing facilities:', error);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: DASHBOARD_ACTIONS.CLEAR_ERROR });
  };

  // Initialize data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const value = {
    ...state,
    loadDashboardData,
    refreshMetrics,
    refreshTransactions,
    refreshFacilities,
    clearError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export { DASHBOARD_ACTIONS };
