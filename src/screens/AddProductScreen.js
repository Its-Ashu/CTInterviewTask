import React, {useState} from 'react';
import {View, TextInput, Button, Image, StyleSheet} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useDispatch} from 'react-redux';
import uuid from 'react-native-uuid';
import { addProduct } from '../store/productSlice';

export default function AddProductScreen({navigation}) {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');

  const dispatch = useDispatch();

  const pickImage = () => {
    launchImageLibrary({}, response => {
      if (response.assets) {
        setImage(response.assets[0].uri);
      }
    });
  };

  const captureImage = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        saveToPhotos: true,
      },
      response => {
        if (response.assets) {
          setImage(response.assets[0].uri);
        }
      },
    );
  };

  const handleAdd = () => {
    dispatch(addProduct({
      id: uuid.v4(),
      name,
      description: desc,
      price,
      image,
    }));

    navigation.goBack();
  };

  return (
    <View>
      <Button title="Capture Image" onPress={captureImage} />
      <Button title="Pick from Gallery" onPress={pickImage} />

      {image && <Image source={{uri: image}} style={styles.image} />}

      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Description" onChangeText={setDesc} />
      <TextInput placeholder="Price" onChangeText={setPrice} />

      <Button title="Add Product" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {height: 100},
});