import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { getWorkouts } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function Workouts() {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('History'); // 'History' or 'Calendar'

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const allWorkouts = await getWorkouts();
      // Sort by date (newest first)
      const sortedWorkouts = allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- Calendar Logic ---

  const workoutsByDate = useMemo(() => {
    const map = {};
    workouts.forEach(workout => {
      if (!map[workout.date]) {
        map[workout.date] = [];
      }
      map[workout.date].push(workout);
    });
    return map;
  }, [workouts]);

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];

    // Padding for empty slots before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <View style={styles.calendarContainer}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Days of Week */}
        <View style={styles.weekHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {days.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dateString = date.toISOString().split('T')[0];
            const hasWorkout = workoutsByDate[dateString]?.length > 0;
            const isSelected = selectedDate === dateString;
            const isToday = dateString === new Date().toISOString().split('T')[0];

            return (
              <TouchableOpacity
                key={dateString}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDayCell,
                  isToday && !isSelected && styles.todayCell
                ]}
                onPress={() => setSelectedDate(isSelected ? null : dateString)}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                  isToday && !isSelected && styles.todayText
                ]}>
                  {date.getDate()}
                </Text>
                {hasWorkout && (
                  <View style={[
                    styles.workoutDot,
                    isSelected && { backgroundColor: COLORS.background }
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const iconColors = getIconColors(item.type);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddWorkout', { workout: item })}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: iconColors.bg }]}>
            <Ionicons
              name={getIconName(item.type)}
              size={20}
              color={iconColors.color}
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>{item.type}</Text>
            <Text style={styles.cardStats}>
              {item.duration} min • {item.calories || 0} kcal
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.time}>{formatDate(item.date)}</Text>
          {item.isRestDay && <Text style={styles.restTag}>Rest Day</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const displayedWorkouts = viewMode === 'History'
    ? workouts
    : (selectedDate ? workoutsByDate[selectedDate] || [] : []);
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={FONTS.h2}>Your Workouts</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'History' && styles.toggleActive]}
            onPress={() => setViewMode('History')}>
            <Text style={[styles.toggleText, viewMode === 'History' && styles.toggleTextActive]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'Calendar' && styles.toggleActive]}
            onPress={() => setViewMode('Calendar')}>
            <Text style={[styles.toggleText, viewMode === 'Calendar' && styles.toggleTextActive]}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'Calendar' && (
        <View>
          {renderCalendar()}
          {selectedDate && (
            <View style={styles.dateHeader}>
              <Text style={styles.dateHeaderText}>
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={displayedWorkouts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              {viewMode === 'Calendar' && !selectedDate ? (
                <Text style={styles.emptySubText}>Select a date to view workouts</Text>
              ) : (
                <>
                  <Ionicons name="barbell-outline" size={64} color={COLORS.textGray} />
                  <Text style={styles.emptyText}>No workouts found</Text>
                  <Text style={styles.emptySubText}>
                    {viewMode === 'Calendar'
                      ? "No workouts logged for this day."
                      : "Tap the + button to add your first workout!"}
                  </Text>
                </>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 10,
    marginTop: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 4,
    marginTop: 15,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.primaryBlue,
  },
  toggleText: {
    color: COLORS.textGray,
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: COLORS.textWhite,
  },

  // Calendar Styles
  calendarContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  monthTitle: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    color: COLORS.textGray,
    fontSize: 12,
    width: 30,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: (width - SIZES.padding * 2) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayText: {
    color: COLORS.textWhite,
    fontSize: 14,
  },
  selectedDayCell: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 20,
    width: 36,
    height: 36,
    marginHorizontal: ((width - SIZES.padding * 2) / 7 - 36) / 2, // Center manually
  },
  selectedDayText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
    borderRadius: 20,
    width: 36,
    height: 36,
    marginHorizontal: ((width - SIZES.padding * 2) / 7 - 36) / 2,
  },
  todayText: {
    color: COLORS.primaryBlue,
    fontWeight: 'bold',
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.success,
    position: 'absolute',
    bottom: 4,
  },
  dateHeader: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 10,
    marginTop: -10,
  },
  dateHeaderText: {
    color: COLORS.textGray,
    fontSize: 14,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
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
  restTag: {
    color: COLORS.primaryBlue,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: COLORS.textGray,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
