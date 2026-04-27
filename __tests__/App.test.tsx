/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-redux', () => ({
  Provider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('../src/store', () => ({
  store: {},
  persistor: {},
}));

jest.mock('../src/navigations/AppNavigator', () => 'AppNavigator');

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
