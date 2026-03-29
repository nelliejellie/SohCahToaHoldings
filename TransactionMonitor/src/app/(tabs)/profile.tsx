import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  // Extract global layout bindings utilizing Zustand
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.emailText}>{user?.email || 'user@example.com'}</Text>
          <Text style={styles.roleText}>Role: {user?.role || 'Analyst'}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color="#CF5A18" />
            <Text style={styles.menuItemText}>Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#CF5A18" />
            <Text style={styles.menuItemText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#CF5A18" />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EFEFEF', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  content: { padding: 20, flex: 1 },
  avatarSection: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#CF5A18', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  emailText: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  roleText: { fontSize: 14, color: '#666', textTransform: 'capitalize' },
  menuSection: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#FAFAFC' },
  menuItemText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#333', fontWeight: '500' },
  logoutButton: { backgroundColor: '#FF3B30', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, shadowColor: '#FF3B30', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
