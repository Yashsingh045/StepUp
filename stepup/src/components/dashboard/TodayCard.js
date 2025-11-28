import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { getWorkouts, getLatestGoal } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const TodayCard = () => {
    const [todayStats, setTodayStats] = useState({
        steps: 0,
        calories: 0,
        duration: 0,
        workoutCount: 0
    });
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodayData();
    }, []);

    const loadTodayData = async () => {
        try {
            const workouts = await getWorkouts();
            const currentGoal = await getLatestGoal();

            // Get today's date string
            const today = new Date().toISOString().split('T')[0];

            // Filter workouts for today
            const todayWorkouts = workouts.filter(w => w.date === today);

            // Calculate totals
            const stats = todayWorkouts.reduce((acc, workout) => ({
                steps: acc.steps + (parseInt(workout.steps) || 0),
                calories: acc.calories + (parseInt(workout.calories) || 0),
                duration: acc.duration + (parseInt(workout.duration) || 0),
                workoutCount: acc.workoutCount + 1
            }), { steps: 0, calories: 0, duration: 0, workoutCount: 0 });

            setTodayStats(stats);
            setGoal(currentGoal);
        } catch (error) {
            console.error('Error loading today data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressPercentage = () => {
        if (!goal || !goal.targetSteps) return 0;
        // Calculating daily target
        const dailyTarget = goal.targetSteps / 7;
        const percent = (todayStats.steps / dailyTarget) * 100;
        return Math.min(percent, 100);
    };

    const getStatusMessage = () => {
        if (todayStats.workoutCount === 0) return 'No workouts yet';
        if (todayStats.workoutCount === 1) return '1 Workout Completed';
        return `${todayStats.workoutCount} Workouts Completed`;
    };

    const getBadgeText = () => {
        const progress = getProgressPercentage();
        if (progress >= 100) return 'Goal Achieved!';
        if (progress >= 75) return 'Almost There';
        if (progress >= 50) return 'On Track';
        if (progress > 0) return 'Keep Going';
        return 'Get Started';
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={COLORS.textWhite} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.cardTitle}>Today's Overview</Text>
                    <View style={styles.statusRow}>
                        <Ionicons
                            name={todayStats.workoutCount > 0 ? "checkmark-circle" : "time-outline"}
                            size={16}
                            color={todayStats.workoutCount > 0 ? COLORS.success : COLORS.textWhite}
                        />
                        <Text style={styles.statusText}>{getStatusMessage()}</Text>
                    </View>
                </View>
                <View style={styles.badge}>
                    <View style={styles.dot} />
                    <Text style={styles.badgeText}>{getBadgeText()}</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <Text style={styles.activityName}>
                    {todayStats.workoutCount === 0 ? 'Start your day!' : `Today's Activity`}
                </Text>
                <View style={styles.statItem}>
                    <Ionicons name="footsteps" size={14} color={COLORS.primaryOrange} />
                    <Text style={styles.statValue}>{todayStats.steps.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="flame" size={14} color={COLORS.primaryOrange} />
                    <Text style={styles.statValue}>{todayStats.calories} kcal</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="time" size={14} color={COLORS.textWhite} />
                    <Text style={styles.statValue}>{todayStats.duration} min</Text>
                </View>
            </View>

            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primaryBlue,
        borderRadius: SIZES.radius,
        padding: 20,
        marginHorizontal: SIZES.padding,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cardTitle: {
        ...FONTS.h2,
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 4,
        fontSize: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    badgeText: {
        color: COLORS.textWhite,
        fontSize: 12,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    activityName: {
        color: COLORS.textWhite,
        fontWeight: '600',
        fontSize: 14,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        color: COLORS.textWhite,
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 4,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primaryOrange,
        borderRadius: 4,
    },
});

export default TodayCard;
