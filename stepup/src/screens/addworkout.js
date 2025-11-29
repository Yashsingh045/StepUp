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
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  getCustomTypes,
  addCustomType
} from '../utils/storage';

export default function AddWorkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingWorkout = route.params?.workout;

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
    } catch (error) { }
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
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {editingWorkout ? 'Edit Workout' : 'Log Workout'}
        </Text>

        {editingWorkout ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.text} />
            <Text style={styles.dateText}>
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.subtext} />
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

        {/* Rest Day */}
        <View style={styles.card}>
          <View style={styles.rowCenter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={24}
                color={COLORS.text}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.label}>
                Rest Day
              </Text>
            </View>

            <Switch
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={isRestDay ? "#fff" : "#f4f4f4"}
              value={isRestDay}
              onValueChange={setIsRestDay}
            />
          </View>

          <Text style={styles.subtext}>
            Mark this day as a rest day to keep your streak.
          </Text>
        </View>

        {!isRestDay && (
          <>
            <Text style={styles.sectionTitle}>
              Workout Type
            </Text>

            <View style={styles.typeContainer}>
              {allTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    workoutType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setWorkoutType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      workoutType === type && styles.typeTextActive
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.typeButton, styles.customTypeButton]}
                onPress={() => setIsModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={COLORS.text} />
                <Text style={[styles.typeText, styles.customTypeText]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowContainer}>
              {/* Duration */}
              <View style={[styles.inputCard, styles.inputCardLeft]}>
                <Text style={styles.inputLabel}>
                  Duration
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <TextInput
                    style={styles.durationInput}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                  />
                  <Text style={styles.unitText}>
                    min
                  </Text>
                </View>
              </View>

              {/* Calories */}
              <View style={[styles.inputCard, styles.inputCardRight]}>
                <Text style={styles.inputLabel}>
                  Calories
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <TextInput
                    style={styles.durationInput}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                  />
                  <Text style={styles.unitText}>
                    kcal
                  </Text>
                </View>
              </View>
            </View>

            {/* Intensity */}
            <Text style={styles.sectionTitle}>
              Intensity
            </Text>
            <View style={styles.typeContainer}>
              {intensityLevels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.typeButton,
                    styles.intensityButton,
                    intensity === level && styles.typeButtonActive
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      intensity === level && styles.typeTextActive
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
        <Text style={styles.sectionTitle}>
          Notes
        </Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel?..."
          placeholderTextColor={COLORS.placeholder}
          multiline
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={C.WHITE} />
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              New Workout Type
            </Text>

            <TextInput
              style={styles.modalInput}
              value={newTypeName}
              onChangeText={setNewTypeName}
              placeholder="e.g. Pilates"
              placeholderTextColor={COLORS.placeholder}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAdd]}
                onPress={handleAddCustomType}
              >
                <Text style={styles.modalButtonTextAdd}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  scrollView: {
    paddingHorizontal: SIZES.padding
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.text,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    backgroundColor: COLORS.card,
  },
  dateCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.subtext,
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
    borderWidth: 1,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.text,
  },
  typeTextActive: {
    color: '#fff',
  },
  customTypeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  customTypeText: {
    marginLeft: 5,
  },
  intensityButton: {
    paddingHorizontal: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  inputCard: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  inputCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  inputCardRight: {
    flex: 1,
    marginLeft: 10,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: COLORS.subtext,
  },
  durationInput: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    color: COLORS.text,
  },
  unitText: {
    fontSize: 14,
    marginLeft: 5,
    color: COLORS.subtext,
  },
  notesInput: {
    borderRadius: 15,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: COLORS.card,
    color: COLORS.text,
  },
  saveButton: {
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.primary,
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
    padding: 20,
    backgroundColor: COLORS.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.text,
  },
  modalInput: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
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
  modalButtonCancel: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  modalButtonAdd: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  modalButtonText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  modalButtonTextAdd: {
    fontWeight: '600',
    color: "#fff",
  },
});