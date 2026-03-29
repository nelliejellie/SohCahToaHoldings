import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { MockAPI, Transaction } from '../../services/api';

interface DashboardHeaderProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
}

const DashboardHeader = memo(({ user, searchQuery, setSearchQuery, activeFilter, setActiveFilter }: DashboardHeaderProps) => {
  const filters = ['All', 'pending', 'processing', 'success', 'failed'];

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
            <Ionicons name="information-circle" size={16} color="#333" style={{ marginLeft: 4 }} />
          </View>
          <TouchableOpacity style={styles.currencySelector}>
            <Text style={styles.currencyFlag}>🇺🇸</Text>
            <Text style={styles.currencyText}>USD</Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceAmountRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.balanceAmount}>67,048</Text>
          <Text style={styles.balanceDecimals}>.00</Text>
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
          <View style={styles.mainCard}>
            <View style={styles.cardInfoTop}>
              <Ionicons name="hardware-chip" size={32} color="#FFD700" />
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

// TransactionItem optimized via React.memo for ZERO flickering
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
  // Prevent full list re-renders. Only render if critical identity variables mutated
  return (
    prevProps.item.id === nextProps.item.id && 
    prevProps.item.status === nextProps.item.status && 
    prevProps.item.amount === nextProps.item.amount
  );
});


export default function HomeScreen() {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000); 
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTransactions = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);

      const res = await MockAPI.getTransactions(pageNum, 10, activeFilter, debouncedSearch);
      
      if (pageNum === 1) setTransactions(res.data);
      else setTransactions(prev => {
        // Prevent strictly duplicate rows from paginating incorrectly by mapping existing IDs
        const existingIds = new Set(prev.map(t => t.id));
        const nonDuplicates = res.data.filter(t => !existingIds.has(t.id));
        return [...prev, ...nonDuplicates];
      });
      
      setHasMore(res.hasMore);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeFilter, debouncedSearch]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  // Event stream simulation: Updates every 6s
  useEffect(() => {
    const stream = setInterval(() => {
      setTransactions(prev => {
        if (prev.length === 0) return prev;
        
        let map = new Map(prev.map(t => [t.id, t]));
        let modified = false;

        const rand = Math.random();

        if (rand < 0.33) {
          // Update status of random transaction (Reconcile update correctly)
          const keys = Array.from(map.keys());
          const targetId = keys[Math.floor(Math.random() * keys.length)];
          const target = map.get(targetId)!;       
          const statuses: Transaction['status'][] = ['success', 'failed', 'processing', 'pending'];
          const newStatus = statuses.filter(s => s !== target.status)[Math.floor(Math.random() * 3)];
          
          map.set(targetId, { ...target, status: newStatus });
          modified = true;

        } else if (rand < 0.66) {
          // Insert completely new transaction (Prevent duplicate rows efficiently)
          const newId = `tx_stream_${Date.now()}`;
          if (!map.has(newId)) {
            const newTx: Transaction = {
              id: newId,
              reference: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              amount: parseFloat((Math.random() * 5000 + 10).toFixed(2)) * (Math.random() > 0.5 ? 1 : -1),
              currency: 'USD',
              status: 'pending',
              createdAt: new Date().toISOString(),
              deviceInfo: `iPhone ${Math.floor(Math.random() * 5) + 11} / iOS ${Math.floor(Math.random() * 3) + 15}`,
              ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              notes: '',
              isFlagged: false
            };
            // Arrays unshift maintains insertion visually, map iteration respects it
            return [newTx, ...prev];
          }
        } else {
          // Fire a duplicate simulation exactly as requested
          const existing = Array.from(map.values());
          const dupTarget = existing[Math.floor(Math.random() * Math.min(5, existing.length))];
          
          // Reconciles properly without modifying length
          map.set(dupTarget.id, { ...dupTarget });
          modified = true;
        }

        if (modified) {
          return Array.from(map.values());
        }
        return prev;
      });
    }, 6000); 

    return () => clearInterval(stream);
  }, []);

  const handleRefresh = () => fetchTransactions(1, true);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchTransactions(page + 1);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore && !hasMore && transactions.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.emptyText}>End of transactions</Text>
        </View>
      );
    }
    if (!loadingMore) return <View style={{ height: 40 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#FF8C00" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        ListHeaderComponent={
          <DashboardHeader 
            user={user} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            activeFilter={activeFilter} 
            setActiveFilter={setActiveFilter} 
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF8C00" />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        style={{ backgroundColor: transactions.length > 0 || !loading ? '#FFF' : '#FAFAFC' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  flatListContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  greetingText: { fontSize: 12, color: '#888' },
  userNameText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 16, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, backgroundColor: '#FF8C00', borderRadius: 5, borderWidth: 1.5, borderColor: '#FAFAFC' },
  balanceSection: { paddingHorizontal: 20 },
  pillsRow: { flexDirection: 'row', marginBottom: 20 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#EFEFEF', marginRight: 8, backgroundColor: '#FFF' },
  pillActive: { borderColor: '#FFE0B2', backgroundColor: '#FFF5E5' },
  pillText: { fontSize: 12, color: '#666', fontWeight: '500' },
  pillTextActive: { fontSize: 12, color: '#FF8C00', fontWeight: '600' },
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
  visaText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', fontStyle: 'italic' },
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
  filterPillActive: { borderColor: '#FF8C00' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#FF8C00', fontWeight: '600' },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 20, backgroundColor: '#FFF' },
  txIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txDetails: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  txAmount: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  txAmountPositive: { color: '#4CAF50' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', backgroundColor: '#FFF' },
  errorContainer: { alignItems: 'center', padding: 20 },
  errorText: { marginTop: 12, color: '#FF3B30', fontSize: 14, textAlign: 'center' },
  retryButton: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 24, backgroundColor: '#FF8C00', borderRadius: 8 },
  retryButtonText: { color: '#FFF', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 12, color: '#CCC', fontSize: 14 },
  footerContainer: { paddingVertical: 20, alignItems: 'center' }
});
