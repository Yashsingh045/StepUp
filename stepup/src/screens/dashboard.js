import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../constants/theme';
import Header from '../components/dashboard/Header';
import TodayCard from '../components/dashboard/TodayCard';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import WeeklyGoals from '../components/dashboard/WeeklyGoals';

const Dashboard = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
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
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
});

export default Dashboard;
