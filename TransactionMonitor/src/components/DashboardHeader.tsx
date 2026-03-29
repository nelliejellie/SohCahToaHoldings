import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
}

const DashboardHeader = memo(({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }: DashboardHeaderProps) => {
  const { user } = useAuthStore();
  const filters = ['All', 'pending', 'processing', 'success', 'failed'];
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  return (
    <View style={{ backgroundColor: '#FAFAFC' }}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'E'}</Text>
          </View>
          <View>
            <Text style={styles.greetingText}>Good morning 🌤️</Text>
            <Text style={styles.userNameText}>{user?.email ? user.email.split('@')[0] : 'Emmanuel Israel'}</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <View style={styles.pillsRow}>
          <View style={[styles.pill, styles.pillActive]}><Text style={styles.pillTextActive}>FX bought</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>FX sold</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Others</Text></View>
        </View>
        <View style={styles.balanceHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.balanceLabel}>Total FX units</Text>
            <TouchableOpacity onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
              <Ionicons name={isBalanceHidden ? "eye-off" : "eye"} size={16} color="#333" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.currencySelector}>
            <Text style={styles.currencyFlag}>🇺🇸</Text>
            <Text style={styles.currencyText}>USD</Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.balanceAmountRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.balanceAmount}>{isBalanceHidden ? '******' : '67,048'}</Text>
          {!isBalanceHidden && <Text style={styles.balanceDecimals}>.00</Text>}
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconWrapper}>
              <Ionicons name="bag-add-outline" size={24} color="#333" />
            </View>
            <Text style={styles.actionButtonText}>Buy FX</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconWrapper}>
              <Ionicons name="bag-remove-outline" size={24} color="#333" />
            </View>
            <Text style={styles.actionButtonText}>Sell FX</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconWrapper}>
              <Ionicons name="time-outline" size={24} color="#333" />
            </View>
            <Text style={styles.actionButtonText}>Receive{'\n'}money</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardsSection}>
        <Text style={styles.sectionTitle}>Cards</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.mainCard, { overflow: 'hidden', position: 'relative' }]}>
            
            {/* Premium Glossy Overlays (Native CSS only to bypass EAS rebuilds) */}
            <View style={{ position: 'absolute', width: 350, height: 350, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 200, top: -180, right: -50 }} pointerEvents="none" />
            <View style={{ position: 'absolute', width: 600, height: 120, backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ rotate: '-45deg' }], top: 30, left: -100 }} pointerEvents="none" />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: 'rgba(0,0,0,0.15)' }} pointerEvents="none" />

            <View style={styles.cardInfoTop}>
              <Image source={require('../../assets/chip.png')} style={{ width: 45, height: 35, resizeMode: 'contain', borderRadius: 4 }} />
              <Text style={styles.cardTypeText}>Prepaid card</Text>
              <View style={{flex: 1}}/>
              <Text style={styles.visaText}>VISA</Text>
            </View>
            <View style={styles.cardInfoBottom}>
              <View>
                <Text style={styles.cardNumber}>**** 7093</Text>
                <Text style={styles.cardExp}>exp 09/27</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.cardBalance}>$3,048.00</Text>
                <Text style={styles.cardName}>Emmanuel Israel</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.addCardButton}>
            <Ionicons name="add" size={32} color="#666" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.txHeader}>
          <Text style={styles.sectionTitleTx}>Recent transactions</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by reference ('error' for test)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
          {filters.map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={{height: 10, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20}} />
    </View>
  );
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  greetingText: { fontSize: 12, color: '#888' },
  userNameText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 16, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, backgroundColor: '#CF5A18', borderRadius: 5, borderWidth: 1.5, borderColor: '#FAFAFC' },
  balanceSection: { paddingHorizontal: 20 },
  pillsRow: { flexDirection: 'row', marginBottom: 20 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#EFEFEF', marginRight: 8, backgroundColor: '#FFF' },
  pillActive: { borderColor: '#FFE0B2', backgroundColor: '#FFF5E5' },
  pillText: { fontSize: 12, color: '#666', fontWeight: '500' },
  pillTextActive: { fontSize: 12, color: '#CF5A18', fontWeight: '600' },
  balanceHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 14, color: '#333', fontWeight: '600' },
  currencySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  currencyFlag: { fontSize: 14, marginRight: 6 },
  currencyText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginRight: 4 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
  currencySymbol: { fontSize: 20, fontWeight: 'bold', color: '#333', marginRight: 4 },
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: '#111' },
  balanceDecimals: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  actionButton: { flex: 1, backgroundColor: '#FFF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  actionIconWrapper: { marginBottom: 8 },
  actionButtonText: { fontSize: 12, color: '#111', fontWeight: '600', textAlign: 'center' },
  cardsSection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 0, paddingLeft: 20 },
  sectionTitleTx: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 10, paddingLeft: 20 },
  cardsScroll: { paddingHorizontal: 20 },
  mainCard: { width: 320, height: 180, backgroundColor: '#E65100', borderRadius: 20, padding: 20, justifyContent: 'space-between', marginRight: 16 },
  cardInfoTop: { flexDirection: 'row', alignItems: 'center' },
  cardTypeText: { color: '#FFF', marginLeft: 12, fontSize: 14, fontWeight: '500' },
  visaText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' },
  cardInfoBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardNumber: { color: '#FFF', fontSize: 16, fontWeight: '600', letterSpacing: 2, marginBottom: 4 },
  cardExp: { color: '#FFF', fontSize: 10, opacity: 0.8 },
  cardBalance: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardName: { color: '#FFF', fontSize: 12, opacity: 0.9 },
  addCardButton: { width: 60, height: 180, borderWidth: 2, borderColor: '#CCC', borderStyle: 'dashed', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  transactionsSection: { marginTop: 32 },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#EFEFEF' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  filtersScroll: { flexDirection: 'row', marginBottom: 5 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EFEFEF', marginRight: 8, backgroundColor: '#FFF' },
  filterPillActive: { borderColor: '#CF5A18' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#CF5A18', fontWeight: '600' }
});

export default DashboardHeader;
