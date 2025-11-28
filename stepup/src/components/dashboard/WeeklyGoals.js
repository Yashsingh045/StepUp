import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { saveWeeklyGoal, getLatestGoal, getWeeklyStats, seedInitialData } from '../../utils/storage';

const screenWidth = Dimensions.get("window").width;

const CircularProgress = ({ percentage, color, label }) => {
    const radius = 25;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={styles.progressItem}>
            <View style={styles.svgContainer}>
                <Svg height="60" width="60" viewBox="0 0 60 60">
                    <Circle
                        cx="30"
                        cy="30"
                        r={radius}
                        stroke="#333"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <Circle
                        cx="30"
                        cy="30"
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="30, 30"
                    />
                </Svg>
                <View style={styles.progressTextContainer}>
                    <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
                </View>
            </View>
            <Text style={styles.progressLabel}>{label}</Text>
        </View>
    );
};

const WeeklyGoals = () => {
    const [hasGoal, setHasGoal] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);
    const [activeTab, setActiveTab] = useState('steps');
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [goals, setGoals] = useState({
        targetSteps: '',
        targetCalories: '',
        targetMinutes: '',
        targetWorkouts: ''
    });
    const [weeklyData, setWeeklyData] = useState(null);
    const [weeklyStats, setWeeklyStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                await seedInitialData();
                const stats = await getWeeklyStats();

                if (stats && stats.datasets) {
                    stats.datasets = stats.datasets.map(dataset => ({
                        ...dataset,
                        color: (opacity = 1) => `rgba(46, 107, 241, ${opacity})`
                    }));
                }

                setWeeklyData(stats);
                setWeeklyStats(stats.fullStats);

                const savedGoal = await getLatestGoal();
                if (savedGoal) {
                    setGoals({
                        targetSteps: savedGoal.targetSteps?.toString() || '',
                        targetCalories: savedGoal.targetCalories?.toString() || '',
                        targetMinutes: savedGoal.targetMinutes?.toString() || '',
                        targetWorkouts: savedGoal.targetWorkouts?.toString() || ''
                    });
                    setHasGoal(true);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSaveGoal = async () => {
        if (goals.targetSteps && goals.targetCalories && goals.targetMinutes && goals.targetWorkouts) {
            const goalData = {
                weekStart: new Date().toISOString().split('T')[0],
                targetSteps: parseInt(goals.targetSteps),
                targetCalories: parseInt(goals.targetCalories),
                targetMinutes: parseInt(goals.targetMinutes),
                targetWorkouts: parseInt(goals.targetWorkouts)
            };
            await saveWeeklyGoal(goalData);
            setHasGoal(true);
            setShowInputForm(false);
        }
    };

    const getPercentage = (current, goal) => {
        if (!goal) return 0;
        const percent = (current / parseInt(goal)) * 100;
        return percent > 100 ? 100 : percent;
    };

    if (loading || !weeklyData || !weeklyStats) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="small" color={COLORS.primaryBlue} />
            </View>
        );
    }

    const currentSteps = weeklyStats.reduce((sum, day) => sum + day.steps, 0);
    const currentCalories = weeklyStats.reduce((sum, day) => sum + day.calories, 0);
    const currentMinutes = weeklyStats.reduce((sum, day) => sum + day.duration, 0);
    const currentWorkouts = weeklyStats.filter(day => day.duration > 0).length;

    // preparing chart data according to active tab

    const getChartData = () => {
        if (!weeklyData || !weeklyStats) return weeklyData;

        let data;
        switch (activeTab) {
            case 'calories':
                data = weeklyStats.map(s => s.calories);
                break;
            case 'time':
                data = weeklyStats.map(s => s.duration);
                break;
            case 'steps':
            default:
                data = weeklyStats.map(s => s.steps);
                break;
        }

        return {
            ...weeklyData,
            datasets: [{
                data,
                color: (opacity = 1) => `rgba(46, 107, 241, ${opacity})`,
                strokeWidth: 2
            }]
        };
    };

    const handleEditGoal = () => {
        setShowInputForm(true);
        setHasGoal(false);
    };

    const handleDataPointClick = (data) => {
        setSelectedPoint({ value: data.value, index: data.index });
        // for hiding in 3 sec
        setTimeout(() => setSelectedPoint(null), 3000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>Weekly Goal</Text>

                    </View>
                    <Text style={styles.subtitle}>
                        {hasGoal ? "Total Activity (kcal/steps)" : "Set your weekly target"}
                    </Text>

                </View>

                {hasGoal && (
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
                            onPress={() => setActiveTab('steps')}
                        >
                            <Text style={activeTab === 'steps' ? styles.activeTabText : styles.tabText}>Steps</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'calories' && styles.activeTab]}
                            onPress={() => setActiveTab('calories')}
                        >
                            <Text style={activeTab === 'calories' ? styles.activeTabText : styles.tabText}>Calories</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'time' && styles.activeTab]}
                            onPress={() => setActiveTab('time')}
                        >
                            <Text style={activeTab === 'time' ? styles.activeTabText : styles.tabText}>Time</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={styles.editButtonContainer}>
                {hasGoal && (
                    <TouchableOpacity style={styles.editButton} onPress={handleEditGoal}>
                        <Text style={styles.editButtonText}>Edit Goal</Text>
                    </TouchableOpacity>
                )}
            </View>

            {!hasGoal ? (
                <View style={styles.contentContainer}>
                    {!showInputForm ? (
                        <View style={styles.noGoalContainer}>
                            <Text style={styles.noGoalText}>You have not set any weekly goal yet.</Text>
                            <TouchableOpacity
                                style={styles.setGoalButton}
                                onPress={() => setShowInputForm(true)}
                            >
                                <Text style={styles.setGoalButtonText}>Set Weekly Goal</Text>
                            </TouchableOpacity>
                            <Text style={styles.suggestionText}>e.g., total minutes or number of workouts</Text>
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <Text style={styles.formLabel}>Enter Weekly Targets:</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Steps</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 50000"
                                    placeholderTextColor={COLORS.textGray}
                                    keyboardType="numeric"
                                    value={goals.targetSteps}
                                    onChangeText={(text) => setGoals({ ...goals, targetSteps: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Calories (kcal)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 2000"
                                    placeholderTextColor={COLORS.textGray}
                                    keyboardType="numeric"
                                    value={goals.targetCalories}
                                    onChangeText={(text) => setGoals({ ...goals, targetCalories: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Duration (mins)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 300"
                                    placeholderTextColor={COLORS.textGray}
                                    keyboardType="numeric"
                                    value={goals.targetMinutes}
                                    onChangeText={(text) => setGoals({ ...goals, targetMinutes: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>No of Workouts</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 5"
                                    placeholderTextColor={COLORS.textGray}
                                    keyboardType="numeric"
                                    value={goals.targetWorkouts}
                                    onChangeText={(text) => setGoals({ ...goals, targetWorkouts: text })}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveGoal}
                            >
                                <Text style={styles.saveButtonText}>Save Goal</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : (
                <View>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={getChartData()}
                            width={screenWidth - (SIZES.padding * 2) - 40}
                            height={180}
                            yAxisLabel=""
                            yAxisSuffix="k"
                            chartConfig={{
                                backgroundColor: COLORS.cardDark,
                                backgroundGradientFrom: COLORS.cardDark,
                                backgroundGradientTo: COLORS.cardDark,
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(46, 107, 241, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: COLORS.primaryBlue
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: "",
                                    stroke: "rgba(142, 142, 147, 0.1)"
                                }
                            }}
                            bezier
                            style={styles.chart}
                            withVerticalLines={false}
                            onDataPointClick={handleDataPointClick}
                            decorator={() => {
                                if (selectedPoint !== null) {
                                    const chartData = getChartData();
                                    const dataLength = chartData.datasets[0].data.length;
                                    const xPosition = ((screenWidth - (SIZES.padding * 2) - 40) / (dataLength - 1)) * selectedPoint.index;

                                    return (
                                        <View>
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    left: xPosition - 30,
                                                    top: -30,
                                                    backgroundColor: COLORS.primaryBlue,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 6,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                                                    {selectedPoint.value}
                                                </Text>
                                                <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center' }}>
                                                    {chartData.labels[selectedPoint.index]}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                }
                                return null;
                            }}
                        />
                    </View>

                    <View style={styles.circlesContainer}>
                        <CircularProgress
                            percentage={getPercentage(currentSteps, goals.targetSteps)}
                            color={COLORS.primaryBlue}
                            label="Steps"
                        />
                        <CircularProgress
                            percentage={getPercentage(currentCalories, goals.targetCalories)}
                            color={COLORS.primaryOrange}
                            label="Calories"
                        />
                        <CircularProgress
                            percentage={getPercentage(currentMinutes, goals.targetMinutes)}
                            color={COLORS.success}
                            label="Minutes"
                        />
                        <CircularProgress
                            percentage={getPercentage(currentWorkouts, goals.targetWorkouts)}
                            color="#FF6B9D"
                            label="Workouts"
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardDark,
        borderRadius: SIZES.radius,
        padding: 20,
        marginHorizontal: SIZES.padding,
        marginBottom: 20,
        minHeight: 200,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    titleSection: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        ...FONTS.h2,
        color: COLORS.textWhite,
    },
    subtitle: {
        ...FONTS.small,
        marginTop: 4,
    },
    editButtonContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        top: -20,
    },
    editButton: {
        backgroundColor: 'rgba(46, 107, 241, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primaryBlue,
    },
    editButtonText: {
        color: COLORS.primaryBlue,
        fontSize: 12,
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#000',
        borderRadius: 20,
        padding: 4,
        alignItems: 'center',
    },
    tab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    activeTab: {
        backgroundColor: '#333',
    },
    activeTabText: {
        color: COLORS.textWhite,
        fontSize: 12,
        fontWeight: '600',
    },
    tabText: {
        color: COLORS.textGray,
        fontSize: 12,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        paddingRight: 0,
    },
    contentContainer: {
        justifyContent: 'center',
    },
    noGoalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    noGoalText: {
        color: COLORS.textGray,
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    setGoalButton: {
        backgroundColor: COLORS.primaryBlue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginBottom: 12,
    },
    setGoalButtonText: {
        color: COLORS.textWhite,
        fontWeight: '600',
        fontSize: 14,
    },
    suggestionText: {
        color: COLORS.textGray,
        fontSize: 12,
        opacity: 0.7,
    },
    formContainer: {
        padding: 10,
    },
    formLabel: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: COLORS.textGray,
        fontSize: 12,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 12,
        color: COLORS.textWhite,
        borderWidth: 1,
        borderColor: '#333',
    },
    saveButton: {
        backgroundColor: COLORS.primaryBlue,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: COLORS.textWhite,
        fontWeight: '600',
        fontSize: 16,
    },
    circlesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    progressItem: {
        alignItems: 'center',
    },
    svgContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        color: COLORS.textWhite,
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressLabel: {
        color: COLORS.textGray,
        fontSize: 12,
        marginTop: 4,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default WeeklyGoals;
