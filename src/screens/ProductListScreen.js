import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  ScrollView, Alert, StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { addProduct } from '../store/productSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';

export default function ProductListScreen({ navigation }) {
  const products = useSelector(state => state.products.items);
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '' });

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Image Error', response.errorMessage || 'Unable to pick image.');
        return;
      }
      if (response.assets?.[0]?.uri) {
        setForm(f => ({ ...f, image: response.assets[0].uri }));
      }
    });
  };

  const captureImage = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true }, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Unable to capture image.');
        return;
      }
      if (response.assets?.[0]?.uri) {
        setForm(f => ({ ...f, image: response.assets[0].uri }));
      }
    });
  };

  const handleAddProduct = () => {
    if (!form.name || !form.price) {
      Alert.alert('Missing fields', 'Name and price are required.');
      return;
    }
    dispatch(addProduct({
      id: uuid.v4(),
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image: form.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    }));
    setForm({ name: '', description: '', price: '', image: '' });
    setModalVisible(false);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.cardBody}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => navigation.navigate('Checkout', { product: item })}>
            <Text style={styles.buyBtnText}>Buy Now</Text>
            <Icon name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShopApp</Text>
        <Text style={styles.headerSub}>{products.length} Products</Text>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bag-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubText}>Tap + to add your first product</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close-circle" size={28} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {form.image ? (
                  <Image source={{ uri: form.image }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="camera-outline" size={36} color="#FF6B35" />
                    <Text style={styles.imagePickerText}>Add product image</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.imageActionBtn} onPress={captureImage}>
                  <Icon name="camera" size={16} color="#FF6B35" />
                  <Text style={styles.imageActionText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageActionBtn} onPress={pickImage}>
                  <Icon name="images" size={16} color="#FF6B35" />
                  <Text style={styles.imageActionText}>Gallery</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Wireless Earbuds"
                placeholderTextColor="#444"
                value={form.name}
                onChangeText={t => setForm(f => ({ ...f, name: t }))}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief product description..."
                placeholderTextColor="#444"
                value={form.description}
                onChangeText={t => setForm(f => ({ ...f, description: t }))}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1999"
                placeholderTextColor="#444"
                value={form.price}
                onChangeText={t => setForm(f => ({ ...f, price: t }))}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                <Text style={styles.submitBtnText}>Add Product</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#161616',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  productImage: { width: '100%', height: 200, backgroundColor: '#1A1A1A' },
  cardBody: { padding: 16 },
  productName: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  productDesc: { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 20, fontWeight: '800', color: '#FF6B35' },
  buyBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#444', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubText: { color: '#333', fontSize: 13, marginTop: 6 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  imagePicker: {
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 160,
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imagePickerText: { color: '#555', marginTop: 8, fontSize: 13 },
  pickedImage: { width: '100%', height: '100%' },
  imageActions: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  imageActionBtn: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  imageActionText: { color: '#DDD', fontSize: 13, fontWeight: '600' },
  label: { fontSize: 12, color: '#666', fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});