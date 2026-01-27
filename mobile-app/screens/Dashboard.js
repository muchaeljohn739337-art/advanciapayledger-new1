import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, Alert } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDashboard } from '../contexts/DashboardContext';

const { width: screenWidth } = Dimensions.get('window');

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#3b82f6'
  }
};

const StatCard = ({ icon, title, value, change, trend }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={24} color="#3b82f6" />
      </View>
      {change && (
        <View style={trend === 'up' ? styles.trendUp : styles.trendDown}>
          <Icon name={trend === 'up' ? 'trending-up' : 'trending-down'} size={16} color={trend === 'up' ? '#10b981' : '#ef4444'} />
          <Text style={trend === 'up' ? styles.trendTextUp : styles.trendTextDown}>{change}</Text>
        </View>
      )}
    </View>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const TransactionCard = ({ transaction }) => (
  <View style={styles.transactionCard}>
    <View style={styles.transactionHeader}>
      <Text style={styles.transactionId}>{transaction.id}</Text>
      <View style={transaction.status === 'completed' ? styles.statusCompleted : styles.statusPending}>
        <Text style={transaction.status === 'completed' ? styles.statusTextCompleted : styles.statusTextPending}>
          {transaction.status}
        </Text>
      </View>
    </View>
    <Text style={styles.transactionFacility}>{transaction.facility}</Text>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionAmount}>${transaction.amount.toLocaleString()}</Text>
      <Text style={styles.transactionTime}>{transaction.time}</Text>
    </View>
  </View>
);

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
    </View>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { metrics, revenueData, transactions, facilities, isLoading, error, loadDashboardData, refreshMetrics } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFacilityPress = (facility) => {
    Alert.alert('Facility Details', `Selected: ${facility.name}`);
  };

  const handleGenerateReport = () => {
    Alert.alert('Generate Report', 'This would generate a comprehensive dashboard report');
  };

  if (isLoading && !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Demo Mode - Sample Data</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Icon name="refresh" size={20} color="#3b82f6" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportButton} onPress={handleGenerateReport}>
            <Icon name="document-text" size={20} color="#ffffff" />
            <Text style={styles.reportButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <StatCard 
            icon="cash-outline" 
            title="Monthly Revenue" 
            value={metrics?.monthlyRevenue || '$247K'} 
            change={metrics?.revenueChange || '+42%'} 
            trend="up" 
          />
          <StatCard 
            icon="business-outline" 
            title="Active Facilities" 
            value={metrics?.activeFacilities || '24'} 
            change={metrics?.facilitiesChange || '+2'} 
            trend="up" 
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard 
            icon="pulse-outline" 
            title="Total Transactions" 
            value={metrics?.totalTransactions || '1,847'} 
            change={metrics?.transactionsChange || '+18%'} 
            trend="up" 
          />
          <StatCard 
            icon="people-outline" 
            title="Active Patients" 
            value={metrics?.activePatients || '1,083'} 
            change={metrics?.patientsChange || '+12%'} 
            trend="up" 
          />
        </View>

        {revenueData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Revenue Growth</Text>
            <LineChart
              data={revenueData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions?.slice(0, 5).map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Facilities Overview</Text>
          {facilities?.slice(0, 3).map((facility) => (
            <FacilityCard key={facility.id} facility={facility} onPress={handleFacilityPress} />
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendDown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextUp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  trendTextDown: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextCompleted: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065f46',
  },
  statusTextPending: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  transactionFacility: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  transactionTime: {
    fontSize: 12,
    color: '#6b7280',
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
});

export default DashboardScreen;
