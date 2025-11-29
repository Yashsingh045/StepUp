import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getStreak, getBestWeek, getWeeklyTypeBreakdown, saveRestDay, getTotalDurationForWeek, getStreakCalendarData } from "../utils/storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const C = {
  BG_PRIMARY: "#121212",
  CARD_BG: "#1E1E1E",
  TEXT_LIGHT: "#FFFFFFE6",
  TEXT_MUTED: "#AAAAAA",
  BORDER: "#333333",
  PROGRESS_BG: "#444444",
  PRIMARY_ACCENT: "#6C63FF",
  ORANGE_ACCENT: "#FF8C00",
  SUCCESS_ACCENT: "#00C853",
  REST_DAY_ACCENT: "#F08080",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
};

const Progress = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestWeek, setBestWeek] = useState({ weekStart: null, totalDuration: 0 });
  const [weeklyBreakdown, setWeeklyBreakdown] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [lastWeekDuration, setLastWeekDuration] = useState(0);
  const [calendarData, setCalendarData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const currentStreak = await getStreak();
      const best = await getBestWeek();
      const breakdown = await getWeeklyTypeBreakdown();
      const total = await getTotalDurationForWeek(0);
      const lastWeek = await getTotalDurationForWeek(1);
      const calendar = await getStreakCalendarData();

      setStreak(currentStreak);
      setBestWeek(best);
      setWeeklyBreakdown(breakdown);
      setTotalDuration(total);
      setLastWeekDuration(lastWeek);
      setCalendarData(calendar);
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarPress = async (dayData) => {
    if (dayData.status === 'future') return;

    Alert.alert(
      dayData.status === 'today' ? "Today's Activity" : `Activity for ${dayData.date}`,
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Rest Day",
          onPress: async () => {
            await saveRestDay(dayData.date);
            loadData();
          }
        },
        {
          text: "Log Workout",
          onPress: () => navigation.navigate('AddWorkout', { initialDate: dayData.date })
        }
      ]
    );
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getPercentageChange = () => {
    if (lastWeekDuration === 0) return totalDuration > 0 ? "+100%" : "0%";
    const change = ((totalDuration - lastWeekDuration) / lastWeekDuration) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change)}%`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.PRIMARY_ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={20} color={C.ORANGE_ACCENT} />
            <Text style={styles.cardLabel}>Current Streak</Text>
          </View>
          <Text style={styles.largeValue}>{streak} Days</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy-outline" size={20} color={C.PRIMARY_ACCENT} />
            <Text style={styles.cardLabel}>Best Week</Text>
          </View>
          <Text style={styles.largeValue}>{formatDuration(bestWeek.totalDuration)}</Text>
        </View>

        <Text style={styles.sectionTitle}>This Week's Breakdown</Text>

        <View style={styles.card}>
          <Text style={styles.subLabel}>Total Workout Time</Text>
          <Text style={styles.mediumValue}>{formatDuration(totalDuration)}</Text>
          <Text style={styles.comparisonText}>
            vs. Last Week <Text style={{ color: C.SUCCESS_ACCENT }}>{getPercentageChange()}</Text>
          </Text>

          <View style={styles.breakdownContainer}>
            {['Cardio', 'Strength', 'Yoga', 'HIIT'].map((type) => {
              const typeData = weeklyBreakdown.find(item => item.type === type);
              const minutes = typeData ? typeData.duration : 0;
              const max = 300;
              const width = Math.min((minutes / max) * 100, 100);

              return (
                <View key={type} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{type}</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${width}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Maintain Your Streak</Text>

        <View style={styles.card}>
          <View style={styles.calendarRow}>
            {calendarData.map((day, index) => (
              <View key={index} style={styles.calendarDay}>
                <Text style={styles.dayLabel}>{day.day}</Text>
                <TouchableOpacity
                  style={[
                    styles.dayIndicator,
                    day.status === 'completed' && styles.completedIndicator,
                    day.status === 'rest' && styles.restIndicator,
                    day.status === 'today' && styles.todayIndicator,
                    day.status === 'future' && styles.futureIndicator,
                  ]}
                  onPress={() => handleCalendarPress(day)}
                  disabled={day.status === 'future'}
                >
                  {day.status === 'completed' && <Ionicons name="checkmark" size={16} color={C.WHITE} />}
                  {day.status === 'rest' && <MaterialCommunityIcons name="meditation" size={16} color={C.WHITE} />}
                  {day.status === 'today' && <Ionicons name="add" size={16} color={C.TEXT_LIGHT} />}
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Text style={styles.helperText}>Tap '+' to log a workout or mark a rest day.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#1E1E1E"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardLabel: {
    fontSize: 16,
    color: '#A0A0A0',
    marginLeft: 8,
  },
  largeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    color: '#E0E0E0',
  },
  subLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  mediumValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  comparisonText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 12,
  },
  breakdownContainer: {
    gap: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#E0E0E0',
    width: 80,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: C.PRIMARY_ACCENT,
    borderRadius: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarDay: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 8,
    textAlign: 'center',
  },
  dayIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
  },
  completedIndicator: {
    backgroundColor: C.SUCCESS_ACCENT,
  },
  restIndicator: {
    backgroundColor: C.REST_DAY_ACCENT,
  },
  todayIndicator: {
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
    backgroundColor: '#0A1F33',
  },
  futureIndicator: {
    opacity: 0.3,
  },
  helperText: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
  },
});

export default Progress;