import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Read implicitly linked states through global memory preventing excessive physical fetches (UI Layer extraction)
  const tx = useTransactionStore(state => state.transactions.find(t => t.id === id));
  const updateTransactionOptimistic = useTransactionStore(state => state.updateTransactionOptimistic);

  const [noteInput, setNoteInput] = useState(tx?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (tx && noteInput === '') {
       setNoteInput(tx.notes || '');
    }
  }, [tx]);

  const handleToggleFlag = async () => {
    if (!tx || !isAdmin || isUpdating) return;

    try {
      setIsUpdating(true);
      // The store natively handles the Optimistic Extraction & Error Rollback computationally mapping Business Logic securely
      await updateTransactionOptimistic(tx.id, { isFlagged: !tx.isFlagged });
    } catch (err: any) {
      Alert.alert('Update Failed', 'Network simulated error. Local state rolled back reliably.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!tx || !isAdmin || noteInput === tx.notes || isUpdating) return;

    try {
      setIsUpdating(true);
      await updateTransactionOptimistic(tx.id, { notes: noteInput });
    } catch (err: any) {
      Alert.alert('Update Failed', 'Network simulated error. Local state rolled back reliably.');
      setNoteInput(tx.notes || ''); // Revert decoupled input state structurally
    } finally {
      setIsUpdating(false);
    }
  };

  if (!tx) {
    return (
      <SafeAreaView style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Transaction securely missing globally.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Structural Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Memory Parsed Metadata block */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Metadata</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Reference</Text>
            <Text style={styles.value}>{tx.reference}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>${tx.amount.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, { textTransform: 'capitalize' }]}>{tx.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{new Date(tx.createdAt).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Security Context</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Device Info</Text>
            <Text style={styles.value}>{tx.deviceInfo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IP Address</Text>
            <Text style={styles.value}>{tx.ipAddress}</Text>
          </View>
          {tx.isFlagged && (
            <View style={styles.flagBadge}>
              <Ionicons name="warning" size={16} color="#FFF" style={{marginRight: 6}} />
              <Text style={styles.flagText}>Transaction Flagged</Text>
            </View>
          )}
        </View>

        {/* Roles Logic Integration */}
        {isAdmin && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            
            <TouchableOpacity 
              style={[styles.flagButton, tx.isFlagged && styles.flagButtonActive]} 
              onPress={handleToggleFlag}
              disabled={isUpdating}
            >
              <Ionicons name={tx.isFlagged ? "flag" : "flag-outline"} size={20} color={tx.isFlagged ? "#FFF" : "#FF3B30"} />
              <Text style={[styles.flagButtonText, tx.isFlagged && {color: '#FFF'}]}>
                {tx.isFlagged ? 'Remove Flag' : 'Mark as Flagged'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.labelNote}>Internal Notes</Text>
            <TextInput
              style={styles.textInput}
              value={noteInput}
              onChangeText={setNoteInput}
              multiline
              numberOfLines={4}
              placeholder="Add internal analyst notes here..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[styles.saveButton, (noteInput === tx.notes || isUpdating) && styles.saveButtonDisabled]} 
              onPress={handleSaveNote}
              disabled={noteInput === tx.notes || isUpdating}
            >
              {isUpdating ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveButtonText}>Save Note</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  centered: { flex: 1, backgroundColor: '#FAFAFC', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  iconButton: { padding: 4 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#111', fontWeight: '500' },
  flagBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  flagText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  flagButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FF3B30', marginBottom: 20 },
  flagButtonActive: { backgroundColor: '#FF3B30' },
  flagButtonText: { marginLeft: 8, color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  labelNote: { fontSize: 14, color: '#111', fontWeight: 'bold', marginBottom: 8 },
  textInput: { backgroundColor: '#F5F5F7', borderRadius: 12, padding: 16, fontSize: 14, color: '#333', minHeight: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#CF5A18', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  saveButtonDisabled: { backgroundColor: '#FFD199' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  errorText: { color: '#FF3B30', marginBottom: 16 },
  backButton: { backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: '#FFF', fontWeight: 'bold' }
});
