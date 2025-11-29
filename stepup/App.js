import { StatusBar } from 'expo-status-bar';
import AppNavigation from './src/navigation/navigation';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
      <StatusBar style="light" />
    </AuthProvider>
  );
}
