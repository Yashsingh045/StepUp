import { StatusBar } from 'expo-status-bar';
import AppNavigation from './src/navigation/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
    <ThemeProvider>
      <AppNavigation />
      <StatusBar style="light" />
    </ThemeProvider>
    </AuthProvider>
  );
}
