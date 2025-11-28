import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getWorkouts } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const RecentWorkouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            const allWorkouts = await getWorkouts();

            // Sort by date (most recent first) and take top 5
            const sortedWorkouts = allWorkouts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            setWorkouts(sortedWorkouts);
        } catch (error) {
            console.error('Error loading workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconName = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('cardio') || lowerType.includes('run')) return 'walk';
        if (lowerType.includes('yoga')) return 'body';
        if (lowerType.includes('strength')) return 'barbell';
        return 'fitness';
    };

    const getIconColors = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('cardio') || lowerType.includes('run')) {
            return { bg: 'rgba(255, 107, 157, 0.2)', color: '#FF6B9D' };
        }
        if (lowerType.includes('yoga')) {
            return { bg: 'rgba(138, 92, 246, 0.2)', color: '#8A5CF6' };
        }
        if (lowerType.includes('strength')) {
            return { bg: 'rgba(46, 107, 241, 0.2)', color: COLORS.primaryBlue };
        }
        return { bg: 'rgba(46, 107, 241, 0.2)', color: COLORS.primaryBlue };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Workouts</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primaryBlue} />
                </View>
            </View>
        );
    }

    if (workouts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Workouts</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No workouts yet. Start logging your activities!</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Workouts</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {workouts.map((workout) => {
                    const iconColors = getIconColors(workout.type);
                    return (
                        <View key={workout.id} style={styles.card}>
                            <View style={styles.leftContent}>
                                <View style={[styles.iconContainer, { backgroundColor: iconColors.bg }]}>
                                    <Ionicons
                                        name={getIconName(workout.type)}
                                        size={20}
                                        color={iconColors.color}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>{workout.type}</Text>
                                    <Text style={styles.cardStats}>
                                        {workout.duration} min • {workout.calories || 0} kcal
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.time}>{formatDate(workout.date)}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 100, // Space for bottom nav
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        ...FONTS.h2,
        color: COLORS.textWhite,
    },
    viewAll: {
        color: COLORS.primaryBlue,
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardStats: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    time: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textGray,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default RecentWorkouts;
