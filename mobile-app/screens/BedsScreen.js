import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BedStatusCard = ({ facility, totalBeds, occupiedBeds, occupancyRate }) => (
  <View style={styles.bedStatusCard}>
    <View style={styles.bedStatusHeader}>
      <Text style={styles.bedStatusFacilityName}>{facility}</Text>
      <Text style={styles.bedStatusBeds}>{totalBeds} beds</Text>
    </View>
    <View style={styles.bedProgressBar}>
      <View style={[styles.bedProgressFill, { width: `${occupancyRate}%` }]} />
    </View>
    <View style={styles.bedStatusFooter}>
      <Text style={styles.bedOccupiedText}>{occupiedBeds} occupied</Text>
      <Text style={styles.bedOccupancyRate}>{occupancyRate}%</Text>
    </View>
  </View>
);

const BedsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const facilities = [
    { name: 'Healthcare Facility A', totalBeds: 150, occupiedBeds: 131, occupancyRate: 87 },
    { name: 'Healthcare Facility B', totalBeds: 80, occupiedBeds: 74, occupancyRate: 92 },
    { name: 'Healthcare Facility C', totalBeds: 120, occupiedBeds: 94, occupancyRate: 78 },
    { name: 'Healthcare Facility D', totalBeds: 95, occupiedBeds: 80, occupancyRate: 84 },
    { name: 'Healthcare Facility E', totalBeds: 70, occupiedBeds: 62, occupancyRate: 89 },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bed Management</Text>
          <Text style={styles.headerSubtitle}>Track bed availability and occupancy across facilities</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>515</Text>
            <Text style={styles.statLabel}>Total Beds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>441</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>86%</Text>
            <Text style={styles.statLabel}>Avg Occupancy</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Facility Bed Status</Text>
          {facilities.map((facility, index) => (
            <BedStatusCard
              key={index}
              facility={facility.name}
              totalBeds={facility.totalBeds}
              occupiedBeds={facility.occupiedBeds}
              occupancyRate={facility.occupancyRate}
            />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Bed Type Distribution</Text>
          <View style={styles.bedTypesContainer}>
            <View style={styles.bedTypeCard}>
              <Icon name="bed-outline" size={24} color="#3b82f6" />
              <Text style={styles.bedTypeTitle}>Standard</Text>
              <Text style={styles.bedTypeCount}>320</Text>
              <Text style={styles.bedTypeLabel}>Beds</Text>
            </View>
            <View style={styles.bedTypeCard}>
              <Icon name="medkit-outline" size={24} color="#10b981" />
              <Text style={styles.bedTypeTitle}>ICU</Text>
              <Text style={styles.bedTypeCount}>45</Text>
              <Text style={styles.bedTypeLabel}>Beds</Text>
            </View>
            <View style={styles.bedTypeCard}>
              <Icon name="heart-outline" size={24} color="#f59e0b" />
              <Text style={styles.bedTypeTitle}>Emergency</Text>
              <Text style={styles.bedTypeCount}>80</Text>
              <Text style={styles.bedTypeLabel}>Beds</Text>
            </View>
            <View style={styles.bedTypeCard}>
              <Icon name="star-outline" size={24} color="#8b5cf6" />
              <Text style={styles.bedTypeTitle}>Premium</Text>
              <Text style={styles.bedTypeCount}>70</Text>
              <Text style={styles.bedTypeLabel}>Beds</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Occupancy Trends</Text>
          <View style={styles.trendsCard}>
            <View style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Icon name="trending-up" size={20} color="#10b981" />
                <Text style={styles.trendTitle}>Daily Average</Text>
              </View>
              <Text style={styles.trendValue}>84%</Text>
              <Text style={styles.trendDescription}>+3% from last week</Text>
            </View>
            <View style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Icon name="trending-down" size={20} color="#ef4444" />
                <Text style={styles.trendTitle}>Weekend Low</Text>
              </View>
              <Text style={styles.trendValue}>76%</Text>
              <Text style={styles.trendDescription}>-8% from weekdays</Text>
            </View>
            <View style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Icon name="pulse" size={20} color="#3b82f6" />
                <Text style={styles.trendTitle}>Peak Hours</Text>
              </View>
              <Text style={styles.trendValue}>92%</Text>
              <Text style={styles.trendDescription}>2PM - 6PM daily</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
          <View style={styles.alertsContainer}>
            <View style={styles.alertCard}>
              <Icon name="warning" size={20} color="#f59e0b" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>High Occupancy</Text>
                <Text style={styles.alertDescription}>Facility C ICU at 95% capacity</Text>
              </View>
            </View>
            <View style={styles.alertCard}>
              <Icon name="checkmark-circle" size={20} color="#10b981" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Beds Available</Text>
                <Text style={styles.alertDescription}>15 new beds opened at Facility A</Text>
              </View>
            </View>
            <View style={styles.alertCard}>
              <Icon name="information-circle" size={20} color="#3b82f6" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Maintenance</Text>
                <Text style={styles.alertDescription}>Scheduled cleaning at Facility B</Text>
              </View>
            </View>
          </View>
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
  bedStatusCard: {
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
  bedStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bedStatusFacilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bedStatusBeds: {
    fontSize: 14,
    color: '#6b7280',
  },
  bedProgressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  bedProgressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  bedStatusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedOccupiedText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bedOccupancyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  bedTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bedTypeCard: {
    width: '48%',
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
  bedTypeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  bedTypeCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bedTypeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  trendsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendItem: {
    marginBottom: 20,
  },
  trendItem:lastChild: {
    marginBottom: 0,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default BedsScreen;
