import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useAuthStore } from '../store/authStore';

const MOCK_TRANSACTIONS = [
  { id: 'tx_1', amount: 12500.00, status: 'completed', date: '2026-03-28' },
  { id: 'tx_2', amount: 340.50, status: 'pending', date: '2026-03-27' },
  { id: 'tx_3', amount: 8900.25, status: 'flagged', date: '2026-03-26' },
];

export default function TransactionScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.txCard}>
      <View>
        <Text style={styles.txId}>{item.id}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.txAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={[
          styles.txStatus, 
          item.status === 'completed' ? styles.statusCompleted : 
          item.status === 'flagged' ? styles.statusFlagged : styles.statusPending
        ]}>{item.status.toUpperCase()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, {user?.role}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={MOCK_TRANSACTIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 6,
  },
  logoutText: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
  },
  txId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  txDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  txStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#EF6C00',
  },
  statusFlagged: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  }
});
