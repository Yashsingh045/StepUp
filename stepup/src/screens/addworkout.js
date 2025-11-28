import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddWorkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingWorkout = route.params?.workout;

  const [workoutType, setWorkoutType] = useState('Strength');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);

  // New Fields
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState('Moderate');

  const [customTypes, setCustomTypes] = useState([]);
  const [defaultTypes] = useState(['Strength', 'Cardio', 'Yoga', 'HIIT', 'Pilates', 'Other']);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const intensityLevels = ['Low', 'Moderate', 'High', 'Extreme'];

  useEffect(() => {
    loadData();
    if (editingWorkout) {
      setWorkoutType(editingWorkout.type);
      setDuration(editingWorkout.duration.toString());
      setNotes(editingWorkout.notes);
      setIsRestDay(editingWorkout.isRestDay);
      setDate(new Date(editingWorkout.date));
      if (editingWorkout.calories) setCalories(editingWorkout.calories.toString());
      if (editingWorkout.intensity) setIntensity(editingWorkout.intensity);
    }
  }, [editingWorkout]);

  const loadData = async () => {
    try {
      const existingDataJson = await AsyncStorage.getItem('stepup_data');
      if (existingDataJson) {
        const data = JSON.parse(existingDataJson);
        if (data.customTypes) {
          setCustomTypes(data.customTypes);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddCustomType = async () => {
    if (!newTypeName.trim()) return;

    const trimmedName = newTypeName.trim();

    if (defaultTypes.includes(trimmedName) || customTypes.includes(trimmedName)) {
      Alert.alert('Error', 'This workout type already exists.');
      return;
    }

    const updatedCustomTypes = [...customTypes, trimmedName];
    setCustomTypes(updatedCustomTypes);
    setWorkoutType(trimmedName);
    setNewTypeName('');
    setIsModalVisible(false);

    // Save new type to storage
    try {
      const existingDataJson = await AsyncStorage.getItem('stepup_data');
      let data = existingDataJson ? JSON.parse(existingDataJson) : {};
      data.customTypes = updatedCustomTypes;
      await AsyncStorage.setItem('stepup_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving custom type:', error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const existingDataJson = await AsyncStorage.getItem('stepup_data');
              if (existingDataJson) {
                let data = JSON.parse(existingDataJson);
                data.workouts = data.workouts.filter(w => w.id !== editingWorkout.id);
                await AsyncStorage.setItem('stepup_data', JSON.stringify(data));
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting workout:', error);
            }
          }
        }
      ]
    );
  };

  const saveWorkout = async () => {
    if (!isRestDay && !duration) {
      Alert.alert('Missing Field', 'Please enter a duration for your workout.');
      return;
    }

    try {
      const workoutData = {
        id: editingWorkout ? editingWorkout.id : `uuid-${Date.now()}`,
        date: date.toISOString().split('T')[0], // Store as YYYY-MM-DD
        type: isRestDay ? 'Rest' : workoutType,
        duration: isRestDay ? 0 : parseInt(duration),
        calories: isRestDay ? 0 : parseInt(calories) || 0,
        intensity: isRestDay ? 'Rest' : intensity,
        notes: notes,
        isRestDay: isRestDay,
      };

      const existingDataJson = await AsyncStorage.getItem('stepup_data');
      let data = existingDataJson ? JSON.parse(existingDataJson) : {
        workouts: [],
        weeklyGoals: [],
        customTypes: []
      };

      if (!data.workouts) data.workouts = [];

      if (editingWorkout) {
        const index = data.workouts.findIndex(w => w.id === editingWorkout.id);
        if (index !== -1) {
          data.workouts[index] = workoutData;
        }
      } else {
        data.workouts.push(workoutData);
      }

      await AsyncStorage.setItem('stepup_data', JSON.stringify(data));
      Alert.alert('Success', 'Workout saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  // Ensure unique types by filtering out custom types that are already in defaultTypes
  const uniqueCustomTypes = customTypes.filter(type => !defaultTypes.includes(type));
  const allTypes = [...defaultTypes, ...uniqueCustomTypes];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="close" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={FONTS.h2}>{editingWorkout ? 'Edit Workout' : 'Log Workout'}</Text>
        {editingWorkout ? (
          <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={COLORS.primaryOrange} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Date Picker */}
        <TouchableOpacity style={styles.dateCard} onPress={() => setShowDatePicker(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.textWhite} style={{ marginRight: 10 }} />
            <Text style={styles.dateText}>{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.textGray} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            themeVariant="dark"
          />
        )}

        {/* Rest Day Toggle */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="bed-outline" size={24} color={COLORS.textWhite} style={{ marginRight: 10 }} />
              <Text style={styles.label}>Rest Day</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#4C9FFF" }}
              thumbColor={isRestDay ? "#fff" : "#f4f3f4"}
              onValueChange={setIsRestDay}
              value={isRestDay}
            />
          </View>
          <Text style={styles.subtext}>Mark this day as a rest day to keep your streak.</Text>
        </View>

        {!isRestDay && (
          <>
            {/* Workout Type Selector */}
            <Text style={styles.sectionTitle}>Workout Type</Text>
            <View style={styles.typeContainer}>
              {allTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    workoutType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setWorkoutType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      workoutType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.typeButton, styles.addTypeButton]}
                onPress={() => setIsModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={COLORS.textWhite} />
                <Text style={[styles.typeText, { marginLeft: 5 }]}>Custom</Text>
              </TouchableOpacity>
            </View>

            {/* Duration & Calories Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputCard, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
                  <TextInput
                    style={styles.durationInput}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textGray}
                  />
                  <Text style={styles.unitText}>min</Text>
                </View>
              </View>

              <View style={[styles.inputCard, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Calories</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }}>
                  <TextInput
                    style={styles.durationInput}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textGray}
                  />
                  <Text style={styles.unitText}>kcal</Text>
                </View>
              </View>
            </View>

            {/* Intensity Selector */}
            <Text style={styles.sectionTitle}>Intensity</Text>
            <View style={styles.typeContainer}>
              {intensityLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.typeButton,
                    intensity === level && styles.typeButtonActive,
                    { paddingHorizontal: 20 }
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text style={[
                    styles.typeText,
                    intensity === level && styles.typeTextActive
                  ]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Workout Notes */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel?..."
          placeholderTextColor={COLORS.textGray}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.background} style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Type Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Workout Type</Text>
            <TextInput
              style={styles.modalInput}
              value={newTypeName}
              onChangeText={setNewTypeName}
              placeholder="e.g. Pilates"
              placeholderTextColor={COLORS.textGray}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddCustomType}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.background }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
  },
  scrollView: {
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.textWhite,
    marginBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  dateCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  subtext: {
    color: COLORS.textGray,
    fontSize: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: COLORS.cardDark,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardDark,
  },
  typeButtonActive: {
    backgroundColor: "#4C9FFF",
    borderColor: "#4C9FFF",
  },
  typeText: {
    color: COLORS.textGray,
    fontWeight: '600',
    fontSize: 14,
  },
  typeTextActive: {
    color: COLORS.background,
  },
  addTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderColor: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    color: COLORS.textGray,
    fontSize: 14,
    marginBottom: 5,
  },
  durationInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    minWidth: 40,
    textAlign: 'center',
  },
  unitText: {
    color: COLORS.textGray,
    fontSize: 14,
    marginLeft: 5,
  },
  notesInput: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 15,
    padding: 15,
    color: COLORS.textWhite,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4C9FFF",
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: COLORS.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#000',
    color: COLORS.textWhite,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#4C9FFF",
    marginLeft: 10,
  },
  modalButtonText: {
    color: COLORS.textWhite,
    fontWeight: '600',
  },
});
