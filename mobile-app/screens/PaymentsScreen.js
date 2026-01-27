import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDashboard } from '../contexts/DashboardContext';

const PaymentMethodCard = ({ method, amount, color, onPress }) => (
  <TouchableOpacity style={styles.paymentMethodCard} onPress={() => onPress(method)}>
    <View style={styles.paymentMethodHeader}>
      <View style={[styles.paymentMethodIcon, { backgroundColor: color }]} />
      <Text style={styles.paymentMethodName}>{method}</Text>
    </View>
    <Text style={styles.paymentMethodAmount}>${amount.toLocaleString()}</Text>
    <Text style={styles.paymentMethodLabel}>Total Volume</Text>
  </TouchableOpacity>
);

const FeatureCard = ({ icon, title, description, color }) => (
  <View style={styles.featureCard}>
    <View style={[styles.featureIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#ffffff" />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const PaymentsScreen = ({ navigation }) => {
  const { isLoading } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const paymentMethods = [
    { method: 'Solana', amount: 98800, color: '#14F195' },
    { method: 'Ethereum', amount: 74100, color: '#627EEA' },
    { method: 'Polygon', amount: 43500, color: '#8247E5' },
    { method: 'Base', amount: 30600, color: '#0052FF' },
  ];

  const features = [
    {
      icon: 'shield-checkmark',
      title: 'Fraud Detection',
      description: 'Real-time transaction monitoring and anomaly detection',
      color: '#10b981',
    },
    {
      icon: 'card',
      title: 'Debit Card Integration',
      description: 'Traditional card processing alongside crypto payments',
      color: '#3b82f6',
    },
    {
      icon: 'wallet',
      title: 'Treasury Management',
      description: 'Automated treasury operations and liquidity management',
      color: '#8b5cf6',
    },
    {
      icon: 'pulse',
      title: 'Real-time Processing',
      description: 'Instant settlement across multiple blockchain networks',
      color: '#f59e0b',
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePaymentMethodPress = (method) => {
    Alert.alert('Payment Method Details', `${method}\n\nTotal Volume: $${paymentMethods.find(m => m.method === method)?.amount.toLocaleString() || '0'}\n\nThis would show detailed transaction history and analytics for ${method}.`);
  };

  const handleNewPayment = () => {
    Alert.alert('New Payment', 'This would open the payment processing interface to create a new transaction.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Processing</Text>
          <Text style={styles.headerSubtitle}>Multi-blockchain payment infrastructure</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Icon name="refresh" size={20} color="#3b82f6" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleNewPayment}>
            <Icon name="add-circle-outline" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>New Payment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$247K</Text>
            <Text style={styles.statLabel}>Monthly Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1,847</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>99.9%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.method}
                method={method.method}
                amount={method.amount}
                color={method.color}
                onPress={handlePaymentMethodPress}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Features</Text>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Security & Compliance</Text>
          <View style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <Icon name="shield-checkmark" size={24} color="#10b981" />
              <Text style={styles.complianceTitle}>Enterprise Security</Text>
            </View>
            <Text style={styles.complianceDescription}>
              Your payments are protected with enterprise-grade security, including end-to-end encryption, 
              multi-signature wallets, and comprehensive audit trails for full regulatory compliance.
            </Text>
            <View style={styles.complianceBadges}>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceBadgeText}>PCI DSS</Text>
              </View>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceBadgeText}>HIPAA</Text>
              </View>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceBadgeText}>SOC 2</Text>
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
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    marginBottom: 12,
  },
  paymentMethodIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  paymentMethodAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  featureCard: {
    flexDirection: 'row',
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
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  complianceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  complianceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  complianceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  complianceBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  complianceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});

export default PaymentsScreen;
