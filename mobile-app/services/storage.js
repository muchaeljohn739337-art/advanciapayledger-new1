import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_PROFILE: '@user_profile',
  DASHBOARD_DATA: '@dashboard_data',
  FACILITIES_DATA: '@facilities_data',
  APP_SETTINGS: '@app_settings',
  LAST_SYNC: '@last_sync',
};

class StorageService {
  // Authentication
  static async setAuthToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
    }
  }

  static async getAuthToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  static async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // User Profile
  static async setUserProfile(profile) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error storing user profile:', error);
    }
  }

  static async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Dashboard Data
  static async setDashboardData(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing dashboard data:', error);
    }
  }

  static async getDashboardData() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  // Facilities Data
  static async setFacilitiesData(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FACILITIES_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing facilities data:', error);
    }
  }

  static async getFacilitiesData() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FACILITIES_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting facilities data:', error);
      return null;
    }
  }

  // App Settings
  static async setAppSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error storing app settings:', error);
    }
  }

  static async getAppSettings() {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error getting app settings:', error);
      return {};
    }
  }

  // Last Sync
  static async setLastSync(timestamp) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Error storing last sync:', error);
    }
  }

  static async getLastSync() {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  // Clear all data
  static async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Get storage size
  static async getStorageSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      let totalSize = 0;
      
      stores.forEach(([key, value]) => {
        if (value) {
          totalSize += key.length + value.length;
        }
      });
      
      return totalSize;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }
}

export default StorageService;
