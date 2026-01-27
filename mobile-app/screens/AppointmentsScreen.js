import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const AppointmentCard = ({ appointment, onPress }) => (
  <TouchableOpacity style={styles.appointmentCard} onPress={() => onPress(appointment)}>
    <View style={styles.appointmentHeader}>
      <View style={styles.appointmentIcon}>
        <Icon name="calendar" size={24} color="#3b82f6" />
      </View>
      <View style={styles.appointmentInfo}>
        <Text style={styles.appointmentPatient}>{appointment.patient}</Text>
        <Text style={styles.appointmentFacility}>{appointment.facility}</Text>
      </View>
      <View style={styles.appointmentTimeContainer}>
        <Text style={styles.appointmentTime}>{appointment.time}</Text>
        <Text style={styles.appointmentType}>{appointment.type}</Text>
      </View>
    </View>
    <View style={styles.appointmentFooter}>
      <View style={[styles.statusBadge, appointment.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
        <Text style={[styles.statusText, appointment.status === 'confirmed' ? styles.statusTextConfirmed : styles.statusTextPending]}>
          {appointment.status}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#6b7280" />
    </View>
  </TouchableOpacity>
);

const AppointmentsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const appointments = [
    { id: 1, patient: 'Patient #1247', facility: 'Healthcare Facility A', time: '10:00 AM', type: 'Consultation', status: 'confirmed' },
    { id: 2, patient: 'Patient #1248', facility: 'Healthcare Facility B', time: '11:30 AM', type: 'Follow-up', status: 'confirmed' },
    { id: 3, patient: 'Patient #1249', facility: 'Healthcare Facility C', time: '2:00 PM', type: 'Surgery', status: 'pending' },
    { id: 4, patient: 'Patient #1250', facility: 'Healthcare Facility D', time: '3:15 PM', type: 'Therapy', status: 'confirmed' },
    { id: 5, patient: 'Patient #1251', facility: 'Healthcare Facility E', time: '4:30 PM', type: 'Consultation', status: 'confirmed' },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAppointmentPress = (appointment) => {
    Alert.alert(
      'Appointment Details',
      `Patient: ${appointment.patient}\nFacility: ${appointment.facility}\nTime: ${appointment.time}\nType: ${appointment.type}\nStatus: ${appointment.status}\n\nThis would show full appointment details and allow editing.`
    );
  };

  const handleNewAppointment = () => {
    Alert.alert('New Appointment', 'This would open the appointment scheduling interface to book a new patient appointment.');
  };

  const handleViewCalendar = () => {
    Alert.alert('Calendar View', 'This would open a full calendar view showing all appointments across all facilities.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerSubtitle}>Schedule and manage patient appointments</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Icon name="refresh" size={20} color="#3b82f6" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleNewAppointment}>
            <Icon name="add-circle-outline" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>New Appointment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity style={styles.calendarButton} onPress={handleViewCalendar}>
              <Icon name="calendar-outline" size={20} color="#3b82f6" />
              <Text style={styles.calendarButtonText}>Calendar</Text>
            </TouchableOpacity>
          </View>
          
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={handleAppointmentPress}
            />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Icon name="time-outline" size={24} color="#3b82f6" />
              <Text style={styles.quickActionTitle}>Schedule</Text>
              <Text style={styles.quickActionDescription}>Book new appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Icon name="checkmark-circle-outline" size={24} color="#10b981" />
              <Text style={styles.quickActionTitle}>Confirm</Text>
              <Text style={styles.quickActionDescription}>Approve pending</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Icon name="notifications-outline" size={24} color="#f59e0b" />
              <Text style={styles.quickActionTitle}>Reminders</Text>
              <Text style={styles.quickActionDescription}>Send notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Icon name="document-text-outline" size={24} color="#8b5cf6" />
              <Text style={styles.quickActionTitle}>Reports</Text>
              <Text style={styles.quickActionDescription}>View analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Appointment Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>92%</Text>
                <Text style={styles.statsLabel}>Show Rate</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>15 min</Text>
                <Text style={styles.statsLabel}>Avg Duration</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>4.8</Text>
                <Text style={styles.statsLabel}>Patient Rating</Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsValue}>98%</Text>
                <Text style={styles.statsLabel}>On-Time</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 8,
    borderRadius: 6,
  },
  calendarButtonText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  appointmentFacility: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentTimeContainer: {
    alignItems: 'flex-end',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  appointmentType: {
    fontSize: 12,
    color: '#6b7280',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextConfirmed: {
    color: '#065f46',
  },
  statusTextPending: {
    color: '#92400e',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
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
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsRow:lastChild: {
    marginBottom: 0,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default AppointmentsScreen;
