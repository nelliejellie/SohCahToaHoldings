import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Transaction } from '../services/api';

// Extracted UI strictly into Presentation Layer mapping completely decoupled logic sets 
const TransactionItem = memo(({ item }: { item: Transaction }) => {
  const router = useRouter();
  const isNegative = item.amount < 0 || item.status === 'failed';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      default: return '#999';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success': return '#E8F5E9';
      case 'failed': return '#ffebee';
      case 'pending': return '#fff3e0';
      case 'processing': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  };

  return (
    <TouchableOpacity style={styles.txRow} onPress={() => router.push(`/transaction/${item.id}` as any)}>
      <View style={[styles.txIconWrapper, { backgroundColor: getStatusBgColor(item.status) }]}>
        <Ionicons name={isNegative ? 'arrow-up-outline' : 'arrow-down-outline'} size={20} color={getStatusColor(item.status)} />
      </View>
      <View style={styles.txDetails}>
        <Text style={styles.txTitle}>{item.reference}</Text>
        <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleDateString()} • {item.status}</Text>
      </View>
      <Text style={[styles.txAmount, !isNegative && styles.txAmountPositive]}>
        {isNegative ? `-$${Math.abs(item.amount).toFixed(2)}` : `$${item.amount.toFixed(2)}`}
      </Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id && 
    prevProps.item.status === nextProps.item.status && 
    prevProps.item.amount === nextProps.item.amount
  );
});

const styles = StyleSheet.create({
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 20, backgroundColor: '#FFF' },
  txIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDetails: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  txAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  txAmountPositive: { color: '#4CAF50' },
});

export default TransactionItem;
