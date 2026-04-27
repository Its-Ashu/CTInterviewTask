import React, { useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import RazorpayCheckout from 'react-native-razorpay';
import { addOrder } from '../store/orderSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';

const CUSTOMER_DETAILS_KEY = '@checkout_customer_details';

export default function CheckoutScreen({ route, navigation }) {
  const { product, cartItems = [], onOrderComplete } = route.params || {};
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberDetails, setRememberDetails] = useState(false);

  React.useEffect(() => {
    const loadSavedDetails = async () => {
      try {
        const saved = await AsyncStorage.getItem(CUSTOMER_DETAILS_KEY);
        if (!saved) {
          return;
        }
        const parsed = JSON.parse(saved);
        if (parsed?.name || parsed?.email || parsed?.phone) {
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setRememberDetails(true);
        }
      } catch (error) {
        // Ignore read errors; user can still proceed manually.
      }
    };

    loadSavedDetails();
  }, []);

  const normalizedItems = cartItems.length
    ? cartItems
    : [{ product, qty: 1 }];

  const total = normalizedItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );

  const handlePayment = () => {
    if (!name || !email || !phone) {
      Alert.alert('Missing Info', 'Please fill all customer details.');
      return;
    }

    const options = {
      description:
        normalizedItems.length > 1
          ? `${normalizedItems.length} items`
          : normalizedItems[0].product.description,
      image: normalizedItems[0].product.image,
      currency: 'INR',
      key: 'rzp_test_SiNmsxvDQw0Req', // 🔑 Replace with your Razorpay test key
      amount: total * 100, // in paise
      name: 'ShopApp',
      prefill: { email, contact: phone, name },
      theme: { color: '#FF6B35' },
    };

    const savePreference = async () => {
      try {
        if (rememberDetails) {
          await AsyncStorage.setItem(
            CUSTOMER_DETAILS_KEY,
            JSON.stringify({ name, email, phone }),
          );
        } else {
          await AsyncStorage.removeItem(CUSTOMER_DETAILS_KEY);
        }
      } catch (error) {
        // Ignore storage errors; checkout should continue.
      }
    };

    savePreference();

    RazorpayCheckout.open(options)
      .then(data => {
        normalizedItems.forEach(item => {
          const order = {
            id: uuid.v4(),
            orderId: data.razorpay_payment_id,
            product: item.product,
            qty: item.qty,
            total: item.product.price * item.qty,
            date: new Date().toISOString(),
            status: 'Confirmed',
          };
          dispatch(addOrder(order));
        });
        if (typeof onOrderComplete === 'function') {
          onOrderComplete();
        }
        navigation.popToTop();
        Alert.alert('🎉 Order Placed!', `Payment ID: ${data.razorpay_payment_id}`, [
          {
            text: 'View Orders',
            onPress: () => {
              const parentNavigation = navigation.getParent();
              if (parentNavigation) {
                parentNavigation.navigate('Orders');
              } else {
                navigation.navigate('Orders');
              }
            },
          },
        ]);
      })
      .catch(error => {
        Alert.alert('Payment Failed', error.description || 'Something went wrong');
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Product Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Products</Text>
          {normalizedItems.map(item => (
            <View style={styles.productCard} key={item.product.id}>
              <Image source={{ uri: item.product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.productMeta}>Qty: {item.qty}</Text>
                <Text style={styles.productPrice}>
                  ₹{(item.product.price * item.qty).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9999999999"
            placeholderTextColor="#444"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.8}
            onPress={() => setRememberDetails(prev => !prev)}>
            <Icon
              name={rememberDetails ? 'checkbox' : 'square-outline'}
              size={22}
              color={rememberDetails ? '#FF6B35' : '#666'}
            />
            <Text style={styles.rememberText}>Remember me for next checkout</Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({normalizedItems.length})</Text>
            <Text style={styles.summaryValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.deliveryValue}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Icon name="lock-closed" size={16} color="#fff" />
          <Text style={styles.payBtnText}>Pay ₹{total.toLocaleString('en-IN')}</Text>
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 Secured by Razorpay</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  headerSpacer: { width: 36 },
  content: { padding: 16, paddingBottom: 40 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
    gap: 14,
  },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#222' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  productMeta: { color: '#888', fontSize: 12, marginBottom: 2 },
  productPrice: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 12, color: '#555', fontWeight: '600', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#252525',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -2,
    marginBottom: 4,
  },
  rememberText: {
    color: '#B8B8B8',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#666', fontSize: 14 },
  summaryValue: { color: '#CCC', fontSize: 14, fontWeight: '600' },
  deliveryValue: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#222', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#FF6B35', fontSize: 20, fontWeight: '800' },
  payBtn: {
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnText: { color: '#FFF', fontWeight: '800', fontSize: 17 },
  secureText: { textAlign: 'center', color: '#444', marginTop: 14, fontSize: 12 },
});