import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

// Demo data
const revenueData = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  datasets: [{
    data: [145000, 168000, 195000, 212000, 247000]
  }]
};

const paymentMethodData = {
  labels: ['Solana', 'Ethereum', 'Polygon', 'Base'],
  datasets: [{
    data: [98800, 74100, 43500, 30600]
  }]
};

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

const facilities = [
  { id: 1, name: 'Demo Healthcare Facility A', location: 'Demo Region 1', revenue: 42500, beds: 150, occupancy: 87, patients: 248 },
  { id: 2, name: 'Demo Healthcare Facility B', location: 'Demo Region 2', revenue: 28300, beds: 80, occupancy: 92, patients: 142 },
  { id: 3, name: 'Demo Healthcare Facility C', location: 'Demo Region 3', revenue: 35700, beds: 120, occupancy: 78, patients: 198 },
];

const recentTransactions = [
  { id: 'DEMO-TX001', facility: 'Demo Healthcare Facility A', amount: 12500, method: 'Solana', status: 'completed', time: '2 min ago' },
  { id: 'DEMO-TX002', facility: 'Demo Healthcare Facility B', amount: 8900, method: 'Ethereum', status: 'completed', time: '15 min ago' },
  { id: 'DEMO-TX003', facility: 'Demo Healthcare Facility C', amount: 15300, method: 'Polygon', status: 'pending', time: '32 min ago' },
];

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

const FacilityCard = ({ facility }) => (
  <View style={styles.facilityCard}>
    <View style={styles.facilityHeader}>
      <View style={styles.facilityIcon}>
        <Icon name="business" size={24} color="#3b82f6" />
      </View>
      <View style={styles.facilityInfo}>
        <Text style={styles.facilityName}>{facility.name}</Text>
        <Text style={styles.facilityLocation}>{facility.location}</Text>
      </View>
    </View>
    <View style={styles.facilityStats}>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Revenue</Text>
        <Text style={styles.facilityStatValue}>${facility.revenue.toLocaleString()}</Text>
      </View>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Beds</Text>
        <Text style={styles.facilityStatValue}>{facility.beds}</Text>
      </View>
      <View style={styles.facilityStat}>
        <Text style={styles.facilityStatLabel}>Occupancy</Text>
        <Text style={styles.facilityStatValue}>{facility.occupancy}%</Text>
      </View>
    </View>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Demo Mode - Sample Data</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="cash-outline" title="Monthly Revenue" value="$247K" change="+42%" trend="up" />
          <StatCard icon="business-outline" title="Active Facilities" value="24" change="+2" trend="up" />
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="pulse-outline" title="Total Transactions" value="1,847" change="+18%" trend="up" />
          <StatCard icon="people-outline" title="Active Patients" value="1,083" change="+12%" trend="up" />
        </View>

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

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Payment Methods</Text>
          <BarChart
            data={paymentMethodData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {recentTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FacilitiesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Healthcare Facilities</Text>
          <Text style={styles.headerSubtitle}>Demo Mode - Sample Data</Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Icon name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Demo Facility</Text>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          {facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PaymentsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Processing</Text>
          <Text style={styles.headerSubtitle}>Demo Mode - Sample Data</Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Icon name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>New Demo Payment</Text>
        </TouchableOpacity>

        <View style={styles.paymentMethodsContainer}>
          {paymentMethodData.labels.map((method, index) => (
            <View key={method} style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodHeader}>
                <View style={styles.paymentMethodIcon} />
                <Text style={styles.paymentMethodName}>{method}</Text>
              </View>
              <Text style={styles.paymentMethodAmount}>${paymentMethodData.datasets[0].data[index].toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AppointmentsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerSubtitle}>Demo Mode - Sample Data</Text>
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Icon name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>New Demo Appointment</Text>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Text style={styles.noDataText}>Demo appointments would appear here</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const BedsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bed Management</Text>
          <Text style={styles.headerSubtitle}>Demo Mode - Sample Data</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="bed-outline" title="Total Beds" value="515" />
          <StatCard icon="people-outline" title="Occupied" value="441" />
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="trending-up-outline" title="Avg Occupancy" value="86%" />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Facility Bed Status</Text>
          {facilities.map((facility) => (
            <View key={facility.id} style={styles.bedStatusCard}>
              <Text style={styles.bedStatusFacilityName}>{facility.name}</Text>
              <Text style={styles.bedStatusBeds}>{facility.beds} beds</Text>
              <View style={styles.bedProgressBar}>
                <View style={[styles.bedProgressFill, { width: `${facility.occupancy}%` }]} />
              </View>
              <Text style={styles.bedOccupancyText}>{facility.occupancy}% occupied</Text>
            </View>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  paymentMethodCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    marginRight: 8,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentMethodAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
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
  bedStatusFacilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  bedStatusBeds: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  bedProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
  },
  bedProgressFill: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  bedOccupancyText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export { DashboardScreen, FacilitiesScreen, PaymentsScreen, AppointmentsScreen, BedsScreen };
