import React from 'react';
import {
  View, Text, FlatList, Image,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

export default function OrderScreen() {
  const orders = useSelector(state => state.orders.items);

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.product.image }} style={styles.orderImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.orderId} numberOfLines={1}>
          ID: {item.orderId}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="cube-outline" size={14} color="#FF6B35" />
            <Text style={styles.metaText}>Qty: {item.qty}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="calendar-outline" size={14} color="#FF6B35" />
            <Text style={styles.metaText}>{formatDate(item.date)}</Text>
          </View>
        </View>

        <Text style={styles.total}>₹{item.total.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>{orders.length} orders placed</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="receipt-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubText}>Your completed orders will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#555', marginTop: 2 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#161616',
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  orderImage: { width: 100, height: 120, backgroundColor: '#1A1A1A' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  productName: { fontSize: 15, fontWeight: '700', color: '#FFF', flex: 1, marginRight: 8 },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusText: { color: '#4CAF50', fontSize: 10, fontWeight: '700' },
  orderId: { color: '#444', fontSize: 11, marginBottom: 10, fontFamily: 'monospace' },
  metaRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#666', fontSize: 12 },
  total: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#444', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubText: { color: '#333', fontSize: 13, marginTop: 6 },
});