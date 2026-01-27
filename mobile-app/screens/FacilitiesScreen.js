import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDashboard } from '../contexts/DashboardContext';

const FacilityCard = ({ facility, onPress }) => (
  <TouchableOpacity style={styles.facilityCard} onPress={() => onPress(facility)}>
    <View style={styles.facilityHeader}>
      <View style={styles.facilityIcon}>
        <Icon name="business" size={24} color="#3b82f6" />
      </View>
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{facility.name}</Text>
        <Text style={styles.facilityLocation}>{facility.location}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#6b7280" />
    </View>
    <View style={styles.facilityStats}>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Revenue</Text>
        <Text style={styles.facilityStatValue}>${facility.revenue?.toLocaleString() || '0'}</Text>
      </View>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Beds</Text>
        <Text style={styles.facilityStatValue}>{facility.beds || '0'}</Text>
      </View>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Occupancy</Text>
        <Text style={styles.facilityStatValue}>{facility.occupancy || '0'}%</Text>
      </View>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Patients</Text>
        <Text style={styles.facilityStatValue}>{facility.patients || '0'}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const FacilitiesScreen = ({ navigation }) => {
  const { facilities, isLoading, loadDashboardData } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing facilities:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFacilityPress = (facility) => {
    Alert.alert('Facility Details', `${facility.name}\n\nRevenue: $${facility.revenue?.toLocaleString() || '0'}\nBeds: ${facility.beds || '0'}\nOccupancy: ${facility.occupancy || '0'}%\nPatients: ${facility.patients || '0'}`);
  };

  const handleAddFacility = () => {
    Alert.alert('Add Facility', 'This would open a form to add a new healthcare facility to the platform.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Healthcare Facilities</Text>
          <Text style={styles.headerSubtitle}>Manage your connected healthcare facilities</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Icon name="refresh" size={20} color="#3b82f6" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFacility}>
            <Icon name="add-circle-outline" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Facility</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{facilities?.length || '24'}</Text>
            <Text style={styles.statLabel}>Total Facilities</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>515</Text>
            <Text style={styles.statLabel}>Total Beds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>86%</Text>
            <Text style={styles.statLabel}>Avg Occupancy</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>All Facilities</Text>
          {facilities?.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} onPress={handleFacilityPress} />
          )) || (
            <View style={styles.placeholderContainer}>
              <Icon name="business-outline" size={48} color="#9ca3af" />
              <Text style={styles.placeholderText}>Loading facilities...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  facilityCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  facilityIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  facilityLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  facilityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facilityStat: {
    alignItems: 'center',
  },
  facilityStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  facilityStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});

export default FacilitiesScreen;
