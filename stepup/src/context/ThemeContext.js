import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme'; 

const ThemeContext = createContext();
const THEME_KEY = '@theme_preference';

export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = (value) => {
    const newMode = value ? 'dark' : 'light';
    setIsDarkMode(value);
    AsyncStorage.setItem(THEME_KEY, newMode);
  };

  const currentColors = {
    primary: COLORS.primaryBlue, 
    background: isDarkMode ? COLORS.darkBackground : COLORS.lightBackground,
    card: isDarkMode ? COLORS.cardDark : COLORS.cardLight, 
    text: isDarkMode ? COLORS.textWhite : COLORS.textDark, 
  };
  
  const themeContextValue = {
    isDarkMode,
    toggleTheme, 
    currentColors, 
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};