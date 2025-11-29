import React, { useState, useEffect } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Modal,
  Switch, TextInput, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser } from "../utils/storage";
import { COLORS } from "../constants/theme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);

  const [person, setPerson] = useState({
    name: "User", email: "user@example.com",
    age: "32", height: "170", weight: "75"
  });

  const [editFields, setEditFields] = useState(person);

  const [fitness, setFitness] = useState({
    totalWorkouts: 128,
    streakDays: 12,
    minutesThisWeek: 120,
    weeklyGoalMinutes: 150,
    overallProgressPercent: 78,
  });

  useFocusEffect(
    React.useCallback(() => {
      const loadSettings = async () => {
        const user = await getUser();
        if (user) {
          setPerson(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
          }));
        }
      };
      loadSettings();
    }, [])
  );
  useEffect(() => {
    setEditFields(person);
  }, [person]);

  const openModal = (type) => {
    setModalType(type);
    if (type === "personal") setEditFields(person);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType("");
  };

  const savePersonalInfo = () => {
    if (!editFields.name.trim() || !editFields.email.trim()) {
      Alert.alert("Validation", "Name and Email cannot be empty.");
      return;
    }
    setPerson(editFields);
    Alert.alert("Saved", "Personal information updated.");
    closeModal();
  };

  const confirmLogout = () => {
    closeModal();
    navigation.navigate("Landing");
  };

  const confirmDelete = () => {
    closeModal();
    Alert.alert(
      "Account Deleted",
      "Your account has been permanently deleted and cannot be recovered."
    );
  };

  const SectionCard = ({ title, items }) => (
    <View style={styles.cardWrapper}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {items.map((it, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.row,
            i < items.length - 1 && styles.rowBorder,
          ]}
          onPress={it.onPress}
        >
          <Feather name={it.icon} size={20} color={COLORS.primary} />
          <Text style={styles.rowLabel}>
            {it.label}
          </Text>
          <Feather name="chevron-right" size={20} color={COLORS.textGray} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPopupContent = () => {
    switch (modalType) {
      case "personal":
        return (
          <>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Personal Information</Text>

            <View style={[styles.inputRow, { borderBottomColor: COLORS.border }]}>
              <Feather name="user" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                value={editFields.name}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, name: v })
                }
                placeholder="Name"
                placeholderTextColor={COLORS.subtext}
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: COLORS.border }]}>
              <Feather name="mail" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                value={editFields.email}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, email: v })
                }
                placeholder="Email"
                placeholderTextColor={COLORS.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: COLORS.border }]}>
              <AntDesign name="calendar" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                value={editFields.age}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, age: v })
                }
                placeholder="Age"
                placeholderTextColor={COLORS.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: COLORS.border }]}>
              <MaterialIcons name="height" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                value={editFields.height}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, height: v })
                }
                placeholder="Height (cm)"
                placeholderTextColor={COLORS.subtext}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: COLORS.border }]}>
              <MaterialIcons
                name="monitor-weight"
                size={20}
                color={COLORS.primary}
              />
              <TextInput
                style={[styles.input, { color: COLORS.text }]}
                value={editFields.weight}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, weight: v })
                }
                placeholder="Weight (kg)"
                placeholderTextColor={COLORS.subtext}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={savePersonalInfo}
            >
              <Text style={styles.confirmText}>Save</Text>
            </TouchableOpacity>
          </>
        );

      case "fitness":
        const percent = Math.min(
          100,
          Math.round(
            (fitness.minutesThisWeek / fitness.weeklyGoalMinutes) * 100
          )
        );
        return (
          <>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Workout Progress</Text>
            <Text style={[styles.progressLabel, { color: COLORS.text }]}>Total Workouts</Text>
            <Text style={[styles.progressValue, { color: COLORS.text }]}>{fitness.totalWorkouts}</Text>

            <Text style={[styles.progressLabel, { marginTop: 10, color: COLORS.text }]}>Streak</Text>
            <Text style={[styles.progressValue, { color: COLORS.text }]}>{fitness.streakDays} days</Text>

            <Text style={[styles.progressLabel, { marginTop: 10, color: COLORS.text }]}>
              Minutes this week
            </Text>
            <View style={[styles.progressBar, { backgroundColor: COLORS.border }]}>
              <View
                style={[styles.progressFill, { width: `${percent}%` }]}
              />
            </View>
            <Text style={[styles.progressSub, { color: COLORS.subtext }]}>
              {fitness.minutesThisWeek}/{fitness.weeklyGoalMinutes} minutes (
              {percent}%)
            </Text>

            <Text style={[styles.progressLabel, { marginTop: 10, color: COLORS.text }]}>
              Overall Progress
            </Text>
            <View style={[styles.progressBar, { backgroundColor: COLORS.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${fitness.overallProgressPercent}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressSub, { color: COLORS.subtext }]}>
              {fitness.overallProgressPercent}%
            </Text>
          </>
        );

      case "notifications":
        return (
          <>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Notifications</Text>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: COLORS.text }]}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.subtext, true: COLORS.primary }}
                thumbColor={COLORS.lightBackground}
              />
            </View>
          </>
        );

      case "units":
        return (
          <>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Units</Text>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: COLORS.text }]}>Metric (kg, cm)</Text>
              <Switch
                value={metricUnits}
                onValueChange={setMetricUnits}
                trackColor={{ false: COLORS.subtext, true: COLORS.primary }}
                thumbColor={COLORS.lightBackground}
              />
            </View>
          </>
        );



      case "logout":
        return (
          <>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Confirm Logout</Text>
            <Text style={[styles.modalMsg, { color: COLORS.subtext }]}>
              Are you sure you want to log out?
            </Text>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmLogout}
            >
              <Text style={styles.confirmText}>Log Out</Text>
            </TouchableOpacity>
          </>
        );

      case "delete":
        return (
          <>
            <Text style={[styles.modalTitle, { color: COLORS.text }]}>Delete Account</Text>
            <Text style={[styles.modalMsg, { color: COLORS.danger }]}>
              Your account will be permanently deleted and cannot be
              recovered.
            </Text>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: COLORS.danger }]}
              onPress={confirmDelete}
            >
              <Text style={styles.confirmText}>Delete Permanently</Text>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: COLORS.text }]}>Profile & Settings</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../assets/avatar.png')}
              style={styles.avatar}
            />
            <TouchableOpacity style={[styles.editIcon, { borderColor: COLORS.background }]}>
              <AntDesign name="edit" size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: COLORS.text }]}>{person.name}</Text>
          <Text style={[styles.sub, { color: COLORS.subtext }]}>{person.email}</Text>
        </View>

        <SectionCard
          title="ACCOUNT"
          items={[
            {
              label: "Personal Information",
              icon: "user",
              onPress: () => openModal("personal"),
            },
            {
              label: "Workout Progress",
              icon: "activity",
              onPress: () => openModal("fitness"),
            },
          ]}
        />

        <SectionCard
          title="PREFERENCES"
          items={[
            {
              label: "Notifications",
              icon: "bell",
              onPress: () => openModal("notifications"),
            },
            {
              label: "Units",
              icon: "settings",
              onPress: () => openModal("units"),
            },
          ]}
        />

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: COLORS.border }]}
          onPress={() => openModal("logout")}
        >
          <Text style={[styles.logoutText, { color: COLORS.text }]}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openModal("delete")}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: COLORS.background }]}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={closeModal}
            >
              <AntDesign name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ paddingTop: 12 }}>
                {renderPopupContent()}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 60 },

  headerRow: { alignItems: "center", marginBottom: 16 },
  header: { fontSize: 22, fontWeight: "700", color: COLORS.text },

  profileContainer: { alignItems: "center", marginBottom: 22 },
  avatarWrapper: { position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.background,
  },

  name: { fontSize: 18, fontWeight: "700", marginTop: 8, color: COLORS.text },
  sub: { marginTop: 4, color: COLORS.subtext },

  cardWrapper: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    color: COLORS.subtext,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowBorder: {
    borderBottomColor: COLORS.border,
  },
  rowLabel: { marginLeft: 12, fontSize: 16, flex: 1, color: COLORS.text },

  logoutBtn: {
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: COLORS.text },

  deleteText: {
    marginTop: 12,
    textAlign: "center",
    color: "#FF3B30",
    fontWeight: "700",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    padding: 18,
    backgroundColor: COLORS.background,
  },
  modalClose: { position: "absolute", right: 12, top: 12, zIndex: 10 },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: COLORS.text },
  modalMsg: { fontSize: 14, marginBottom: 12, color: COLORS.subtext },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  input: { marginLeft: 10, flex: 1, fontSize: 15, paddingVertical: 5, color: COLORS.text },

  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  optionLabel: { fontSize: 16, color: COLORS.text },

  progressLabel: { fontSize: 15, marginTop: 8, color: COLORS.text },
  progressValue: { fontSize: 18, fontWeight: "700", color: COLORS.text },

  progressBar: {
    height: 10,
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  progressFill: { height: "100%", backgroundColor: COLORS.primary },
  progressSub: { fontSize: 12, marginTop: 5, color: COLORS.subtext },
});