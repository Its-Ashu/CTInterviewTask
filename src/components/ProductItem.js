import React from 'react';
import {View, Text, Image, Button, StyleSheet} from 'react-native';

export default function ProductItem({item, onBuy}) {
  return (
    <View style={styles.container}>
      <Image source={{uri: item.image}} style={styles.image} />
      <Text>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>₹ {item.price}</Text>

      <Button title="Buy Now" onPress={onBuy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 10},
  image: {height: 100},
});