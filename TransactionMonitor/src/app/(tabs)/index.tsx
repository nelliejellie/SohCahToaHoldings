import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '../../store/transactionStore';
import DashboardHeader from '../../components/DashboardHeader';
import TransactionItem from '../../components/TransactionItem';

export default function HomeScreen() {
  const {
    transactions, loading, refreshing, loadingMore, error,
    hasMore, activeFilter, searchQuery, debouncedSearch,
    setSearchQuery, setActiveFilter, fetchTransactions, startEventStream, stopEventStream
  } = useTransactionStore();

  // Search Debounce strictly integrated into Presentation Layer
  useEffect(() => {
    const handler = setTimeout(() => {
      useTransactionStore.getState().setDebouncedSearch(searchQuery);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Hooking the separated Business Logic Fetching sequence
  useEffect(() => {
    fetchTransactions(1);
  }, [activeFilter, debouncedSearch]);

  // Independent Operations Stream Initialization
  useEffect(() => {
    startEventStream();
    return () => stopEventStream();
  }, []);

  const handleRefresh = () => fetchTransactions(1, true);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchTransactions(useTransactionStore.getState().page + 1);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#CF5A18" />
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
        <ActivityIndicator size="small" color="#CF5A18" />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#CF5A18" />}
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
  emptyContainer: { paddingVertical: 40, alignItems: 'center', backgroundColor: '#FFF' },
  errorContainer: { alignItems: 'center', padding: 20 },
  errorText: { marginTop: 12, color: '#FF3B30', fontSize: 14, textAlign: 'center' },
  retryButton: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 24, backgroundColor: '#CF5A18', borderRadius: 8 },
  retryButtonText: { color: '#FFF', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 12, color: '#CCC', fontSize: 14 },
  footerContainer: { paddingVertical: 20, alignItems: 'center' }
});
