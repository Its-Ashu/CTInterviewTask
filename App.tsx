import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigations/AppNavigator';

export default function App() {
  return (
    <View style={styles.root}>
      <Provider store={store}>
        <PersistGate
          loading={
            <View style={styles.loading}>
              <ActivityIndicator color="#FF6B35" />
            </View>
          }
          persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});