// FULLY THEME-INTEGRATED AddWorkout.js
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS, SIZES } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  getCustomTypes,
  addCustomType
} from '../utils/storage';
import { useTheme } from "../context/ThemeContext";

export default function AddWorkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingWorkout = route.params?.workout;

  const { isDarkMode, currentColors } = useTheme();

  const [workoutType, setWorkoutType] = useState('Strength');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);

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
    loadTypes();
    if (editingWorkout) {
      setWorkoutType(editingWorkout.type);
      setDuration(editingWorkout.duration.toString());
      setNotes(editingWorkout.notes);
      setIsRestDay(editingWorkout.isRestDay);
      setDate(new Date(editingWorkout.date));
      if (editingWorkout.calories) setCalories(editingWorkout.calories.toString());
      if (editingWorkout.intensity) setIntensity(editingWorkout.intensity);
    } else if (route.params?.initialDate) {
      setDate(new Date(route.params.initialDate));
    }
  }, [editingWorkout, route.params]);

  const loadTypes = async () => {
    try {
      const types = await getCustomTypes();
      const uniqueCustom = types.filter(t => !defaultTypes.includes(t));
      setCustomTypes(uniqueCustom);
    } catch (error) {}
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
    try {
      await addCustomType(trimmedName);
      setCustomTypes([...customTypes, trimmedName]);
      setWorkoutType(trimmedName);
      setNewTypeName('');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom type');
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
              await deleteWorkout(editingWorkout.id);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!isRestDay && !duration) {
      Alert.alert('Missing Field', 'Please enter a duration for your workout.');
      return;
    }

    try {
      const workoutData = {
        id: editingWorkout ? editingWorkout.id : `uuid-${Date.now()}`,
        date: date.toISOString().split('T')[0],
        type: isRestDay ? 'Rest' : workoutType,
        duration: isRestDay ? 0 : parseInt(duration),
        calories: isRestDay ? 0 : parseInt(calories) || 0,
        intensity: isRestDay ? 'Rest' : intensity,
        notes,
        isRestDay
      };

      const json = await AsyncStorage.getItem("stepup_data");
      const data = json ? JSON.parse(json) : { workouts: [] };

      if (editingWorkout) {
        const updated = data.workouts.map(w =>
          w.id === workoutData.id ? workoutData : w
        );
        data.workouts = updated;
      } else {
        data.workouts.push(workoutData);
      }

      await AsyncStorage.setItem("stepup_data", JSON.stringify(data));
      Alert.alert('Success', 'Workout saved successfully!');
      navigation.goBack();

    } catch {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const allTypes = [...defaultTypes, ...customTypes];

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.iconButton, { backgroundColor: currentColors.card }]}
        >
          <Ionicons name="close" size={24} color={currentColors.text} />
        </TouchableOpacity>

        <Text style={[FONTS.h2, { color: currentColors.text }]}>
          {editingWorkout ? 'Edit Workout' : 'Log Workout'}
        </Text>

        {editingWorkout ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: currentColors.card }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* BODY */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Date Card */}
        <TouchableOpacity
          style={[styles.dateCard, { backgroundColor: currentColors.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={24} color={currentColors.text} />
            <Text style={[styles.dateText, { color: currentColors.text, marginLeft: 10 }]}>
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={currentColors.subtext} />
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            themeVariant={isDarkMode ? "dark" : "light"}
          />
        )}

        {/* Rest Day */}
        <View style={[styles.card, { backgroundColor: currentColors.card }]}>
          <View style={styles.rowCenter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={24}
                color={currentColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.label, { color: currentColors.text }]}>
                Rest Day
              </Text>
            </View>

            <Switch
              trackColor={{ false: currentColors.border, true: currentColors.primary }}
              thumbColor={isRestDay ? "#fff" : "#f4f4f4"}
              value={isRestDay}
              onValueChange={setIsRestDay}
            />
          </View>

          <Text style={[styles.subtext, { color: currentColors.subtext }]}>
            Mark this day as a rest day to keep your streak.
          </Text>
        </View>

        {/* Workout Inputs */}
        {!isRestDay && (
          <>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Workout Type
            </Text>

            {/* Workout Type Buttons */}
            <View style={styles.typeContainer}>
              {allTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        workoutType === type ? currentColors.primary : currentColors.card,
                      borderColor:
                        workoutType === type ? currentColors.primary : currentColors.border
                    }
                  ]}
                  onPress={() => setWorkoutType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          workoutType === type ? "#fff" : currentColors.text
                      }
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: currentColors.card,
                    borderColor: currentColors.border,
                    flexDirection: "row",
                    alignItems: "center"
                  }
                ]}
                onPress={() => setIsModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={currentColors.text} />
                <Text style={[styles.typeText, { marginLeft: 5, color: currentColors.text }]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {/* Duration + Calories */}
            <View style={styles.rowContainer}>
              {/* Duration */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: currentColors.card, flex: 1, marginRight: 10 }
                ]}
              >
                <Text style={[styles.inputLabel, { color: currentColors.subtext }]}>
                  Duration
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <TextInput
                    style={[styles.durationInput, { color: currentColors.text }]}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={currentColors.placeholder}
                  />
                  <Text style={[styles.unitText, { color: currentColors.subtext }]}>
                    min
                  </Text>
                </View>
              </View>

              {/* Calories */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: currentColors.card, flex: 1, marginLeft: 10 }
                ]}
              >
                <Text style={[styles.inputLabel, { color: currentColors.subtext }]}>
                  Calories
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <TextInput
                    style={[styles.durationInput, { color: currentColors.text }]}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={currentColors.placeholder}
                  />
                  <Text style={[styles.unitText, { color: currentColors.subtext }]}>
                    kcal
                  </Text>
                </View>
              </View>
            </View>

            {/* Intensity */}
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Intensity
            </Text>
            <View style={styles.typeContainer}>
              {intensityLevels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        intensity === level ? currentColors.primary : currentColors.card,
                      borderColor:
                        intensity === level ? currentColors.primary : currentColors.border,
                      paddingHorizontal: 20
                    }
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          intensity === level ? "#fff" : currentColors.text
                      }
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Notes */}
        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
          Notes
        </Text>
        <TextInput
          style={[
            styles.notesInput,
            { backgroundColor: currentColors.card, color: currentColors.text }
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel?..."
          placeholderTextColor={currentColors.placeholder}
          multiline
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: currentColors.primary }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ADD TYPE MODAL */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.card }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              New Workout Type
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: currentColors.background, color: currentColors.text }
              ]}
              value={newTypeName}
              onChangeText={setNewTypeName}
              placeholder="e.g. Pilates"
              placeholderTextColor={currentColors.placeholder}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: currentColors.card, borderWidth: 1, borderColor: currentColors.border, marginRight: 10 }
                ]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: currentColors.primary, marginLeft: 10 }
                ]}
                onPress={handleAddCustomType}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

/* ------------------------------------------------------- */
/*                     BASE STYLES ONLY                    */
/*              Colors are applied dynamically             */
/* ------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
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
    borderRadius: 20
  },
  scrollView: {
    paddingHorizontal: SIZES.padding
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20
  },
  dateCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600'
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  subtext: {
    fontSize: 12
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1
  },
  typeText: {
    fontWeight: '600',
    fontSize: 14
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  inputCard: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center'
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5
  },
  durationInput: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center'
  },
  unitText: {
    fontSize: 14,
    marginLeft: 5
  },
  notesInput: {
    borderRadius: 15,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16
  },
  saveButton: {
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalInput: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row'
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalButtonText: {
    fontWeight: '600'
  }
});
