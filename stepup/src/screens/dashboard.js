import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/dashboard/Header';
import TodayCard from '../components/dashboard/TodayCard';
import WeeklyGoals from '../components/dashboard/WeeklyGoals';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';

const Dashboard = () => {
  const { currentColors, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={currentColors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <TodayCard />
        <WeeklyGoals />
        <RecentWorkouts />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default Dashboard;
