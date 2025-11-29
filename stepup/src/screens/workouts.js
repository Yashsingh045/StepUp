import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme'; // same constants as AddWorkout

// constants
const BLUE = '#4C9FFF';
const CARD = COLORS.cardDark || '#111';
const BACKGROUND = COLORS.background || '#000';
const TEXT_WHITE = COLORS.textWhite || '#fff';
const TEXT_GRAY = COLORS.textGray || '#9AA0A6';

// date helpers
const isoToDate = (iso) => {
  // iso like "2025-11-29"
  return new Date(iso + 'T00:00:00');
};

const formatDisplayDate = (iso) => {
  const d = isoToDate(iso);
  // e.g., Nov 27
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Workouts() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [workouts, setWorkouts] = useState([]);
  const [view, setView] = useState('History'); // 'History' or 'Calendar'
  const [dateRange, setDateRange] = useState('This Month'); // 'This Month' | 'This Week' | 'All Time'
  const [typeFilter, setTypeFilter] = useState('All Workouts');
  const [sortBy, setSortBy] = useState('Date (Newest)'); // Date (Newest), Date (Oldest), Duration, Calories
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) loadWorkouts();
  }, [isFocused]);

  const loadWorkouts = async () => {
    try {
      const json = await AsyncStorage.getItem('stepup_data');
      const data = json ? JSON.parse(json) : {};
      const arr = data.workouts || [];
      // ensure date format and types
      setWorkouts(arr.slice()); // copy
    } catch (e) {
      console.error('Failed to load workouts', e);
    }
  };

  const saveWorkoutsToStorage = async (newList) => {
    console.log("Workout Saved:", workoutData);

    try {
      const json = await AsyncStorage.getItem('stepup_data');
      const data = json ? JSON.parse(json) : { workouts: [], weeklyGoals: [], customTypes: [] };
      data.workouts = newList;
      await AsyncStorage.setItem('stepup_data', JSON.stringify(data));
      setWorkouts(newList);
    } catch (e) {
      console.error('Failed to save workouts', e);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newList = workouts.filter(w => w.id !== id);
            await saveWorkoutsToStorage(newList);
          }
        }
      ]
    );
  };

  const handleEdit = (workout) => {
    navigation.navigate('AddWorkout', { workout });
  };

  // derive list of types from workouts + default ones
  const workoutTypes = useMemo(() => {
    const set = new Set(['All Workouts']);
    workouts.forEach(w => {
      if (w.type) set.add(w.type);
    });
    return Array.from(set);
  }, [workouts]);

  // Date range filter implementation
  const filterByDateRange = (list) => {
    if (dateRange === 'All Time') return list;

    const now = new Date();
    let startDate;
    if (dateRange === 'This Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'This Week') {
      const day = now.getDay(); // 0 (Sun) - 6
      const diff = now.getDate() - day; // start of week (Sunday)
      startDate = new Date(now.getFullYear(), now.getMonth(), Math.max(1, diff));
    } else {
      startDate = null;
    }

    if (!startDate) return list;

    return list.filter(w => {
      if (!w.date) return false;
      const d = isoToDate(w.date);
      return d >= startDate && d <= now;
    });
  };

  // type filter
  const filterByType = (list) => {
    if (!typeFilter || typeFilter === 'All Workouts') return list;
    return list.filter(w => w.type === typeFilter);
  };

  // sort
  const sortList = (list) => {
    const copy = list.slice();
    if (sortBy === 'Date (Newest)') {
      copy.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sortBy === 'Date (Oldest)') {
      copy.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else if (sortBy === 'Duration') {
      copy.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'Calories') {
      copy.sort((a, b) => (b.calories || 0) - (a.calories || 0));
    }
    return copy;
  };

  const displayed = useMemo(() => {
    const afterDate = filterByDateRange(workouts);
    const afterType = filterByType(afterDate);
    const sorted = sortList(afterType);
    return sorted;
  }, [workouts, dateRange, typeFilter, sortBy]);

  // calendar markings
  const markedDates = useMemo(() => {
    const marks = {};
    workouts.forEach(w => {
      if (!w.date) return;
      const k = w.date;
      if (!marks[k]) {
        marks[k] = { dots: [{ color: BLUE }], marked: true };
      } else {
        // multiple workouts same day -> show multiple dots
        const existing = marks[k].dots || [];
        if (existing.length < 3) existing.push({ color: BLUE });
        marks[k] = { ...marks[k], dots: existing, marked: true };
      }
    });
    return marks;
  }, [workouts]);

  // calendar day press -> filter by that date
  const onDayPress = (day) => {
    // day.dateString like '2025-11-29'
    // We'll set dateRange to 'All Time' and a temporary type of filter 'Selected Day' by setting typeFilter to that exact date
    setDateRange('All Time');
    setTypeFilter(`__DAY__${day.dateString}`);
  };

  // when typeFilter starts with __DAY__, we interpret it as selecting a single day
  const finalDisplayed = useMemo(() => {
    if (typeFilter && typeFilter.startsWith('__DAY__')) {
      const target = typeFilter.replace('__DAY__', '');
      return sortList(workouts.filter(w => w.date === target));
    }
    return displayed;
  }, [typeFilter, displayed, workouts, sortBy]);

  // UI components
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
        <Ionicons name="arrow-back" size={22} color={TEXT_WHITE} />
      </TouchableOpacity>
      <Text style={[FONTS.h2, { color: TEXT_WHITE }]}>Workout History</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AddWorkout')}
        style={styles.iconBtn}
      >
        <Ionicons name="add" size={26} color={TEXT_WHITE} />
      </TouchableOpacity>
    </View>
  );

  const TabSwitch = () => (
    <View style={styles.tabRow}>
      <TouchableOpacity
        style={[styles.tabBtn, view === 'History' && styles.tabActive]}
        onPress={() => setView('History')}
      >
        <Text style={[styles.tabText, view === 'History' && styles.tabTextActive]}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, view === 'Calendar' && styles.tabActive]}
        onPress={() => setView('Calendar')}
      >
        <Text style={[styles.tabText, view === 'Calendar' && styles.tabTextActive]}>Calendar</Text>
      </TouchableOpacity>
    </View>
  );

  const FilterRow = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity style={styles.filterBtn} onPress={() => {
        // cycle date range quickly: This Month -> This Week -> All Time -> This Month
        const order = ['This Month', 'This Week', 'All Time'];
        const next = order[(order.indexOf(dateRange) + 1) % order.length];
        setDateRange(next);
      }}>
        <Text style={styles.filterText}>Date Range: {dateRange}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
        <Text style={styles.filterText}>Filter by Type: {typeFilter === 'All Workouts' ? 'All Workouts' : (typeFilter.startsWith('__DAY__') ? `Day ${typeFilter.replace('__DAY__','')}` : typeFilter)}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterBtn} onPress={() => {
        // cycle sort options
        const order = ['Date (Newest)', 'Date (Oldest)', 'Duration', 'Calories'];
        const next = order[(order.indexOf(sortBy) + 1) % order.length];
        setSortBy(next);
      }}>
        <Text style={styles.filterText}>Sort By: {sortBy}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={iconNameForType(item.type)} size={22} color={BACKGROUND} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{item.type}</Text>
          <Text style={styles.cardSubtitle}>
            {item.isRestDay ? 'Rest Day' : `${item.duration} min · ${item.calories || 0} kcal`}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardDate}>{displayDateShort(item.date)}</Text>
          <TouchableOpacity onPress={() => openMoreMenu(item)} style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={TEXT_GRAY} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // helper: map type to icon (small mapping)
  function iconNameForType(type) {
    if (!type) return 'run';
    const t = type.toLowerCase();
    if (t.includes('strength') || t.includes('weight')) return 'dumbbell';
    if (t.includes('run') || t.includes('cardio')) return 'run';
    if (t.includes('yoga')) return 'yoga'; // may not exist in all icon sets; fallback
    if (t.includes('hiit')) return 'fire';
    if (t.includes('pilates')) return 'human-greeting';
    if (t.includes('rest')) return 'bed-empty';
    return 'run';
  }

  function displayDateShort(iso) {
    if (!iso) return '';
    const d = isoToDate(iso);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff < 1) return 'Today';
    if (diff < 2) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // show more menu (Edit / Delete)
  const openMoreMenu = (item) => {
    Alert.alert(
      'Options',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEdit(item) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
      ]
    );
  };

  // Split into recent (last 7 days) and past
const now = new Date();
const sevenDaysAgo = new Date(now);
sevenDaysAgo.setDate(now.getDate() - 7);

const recentWorkouts = finalDisplayed.filter(w => {
  const d = isoToDate(w.date);
  return d >= sevenDaysAgo;
});

const olderWorkouts = finalDisplayed.filter(w => {
  const d = isoToDate(w.date);
  return d < sevenDaysAgo;
});


  return (
    <View style={styles.container}>
      <Header />
      <TabSwitch />
      <FilterRow />

      {view === 'Calendar' ? (
        <View style={{ paddingHorizontal: 15 }}>
          <Calendar
            markingType={'multi-dot'}
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              backgroundColor: BACKGROUND,
              calendarBackground: BACKGROUND,
              monthTextColor: TEXT_WHITE,
              dayTextColor: TEXT_WHITE,
              selectedDayBackgroundColor: BLUE,
              textSectionTitleColor: TEXT_GRAY,
              arrowColor: TEXT_WHITE,
              todayTextColor: BLUE,
            }}
          />

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Recent Activity</Text>

          <FlatList
            data={finalDisplayed}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No workouts to show.</Text>}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={finalDisplayed}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No workouts yet. Log one now!</Text>}
          />
        </>
      )}

      {/* Filter Modal (type select) */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[FONTS.h3, { color: TEXT_WHITE, marginBottom: 12 }]}>Filter by Type</Text>
            <View style={{ maxHeight: 300 }}>
              <FlatList
                data={workoutTypes}
                keyExtractor={(t) => t}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setTypeFilter(item);
                      setFilterModalVisible(false);
                    }}
                    style={[styles.typeRow, item === typeFilter && { backgroundColor: '#0d2233' }]}
                  >
                    <Text style={{ color: TEXT_WHITE }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <TouchableOpacity style={styles.modalClose} onPress={() => setFilterModalVisible(false)}>
              <Text style={{ color: BLUE, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CARD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    margin: 15,
    backgroundColor: 'transparent',
    borderRadius: 30,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 26,
    backgroundColor: CARD,
    marginHorizontal: 6,
    borderRadius: 25,
  },
  tabActive: {
    backgroundColor: BLUE,
  },
  tabText: {
    color: TEXT_GRAY,
    fontWeight: '700',
  },
  tabTextActive: {
    color: BACKGROUND,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  filterBtn: {
    backgroundColor: CARD,
    padding: 10,
    borderRadius: 20,
    marginVertical: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  filterText: {
    color: TEXT_WHITE,
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    ...FONTS.h3,
    color: TEXT_WHITE,
    fontSize: 18,
    marginTop: 12,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: TEXT_WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: TEXT_GRAY,
    marginTop: 6,
  },
  cardDate: {
    color: TEXT_GRAY,
    fontSize: 13,
  },
  moreBtn: {
    marginTop: 8,
  },
  emptyText: {
    color: TEXT_GRAY,
    textAlign: 'center',
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 18,
    maxHeight: '80%',
  },
  typeRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalClose: {
    marginTop: 12,
    alignItems: 'center',
  },
});