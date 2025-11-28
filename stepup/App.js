import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AppNavigation from './src/navigation/navigation';

export default function App() {
  return (
    <>
      <AppNavigation />
      <StatusBar style="light" />
    </>
  );
}
