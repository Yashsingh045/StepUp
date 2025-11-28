import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AntDesign,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Define a color palette for both light and dark themes
const COLORS = {
  primary: "#6C63FF",
  lightBackground: "#fff",
  darkBackground: "#121212",
  lightCard: "#F7F7F8",
  darkCard: "#1E1E1E",
  lightText: "#000",
  darkText: "#FFFFFFE6", // 90% white for primary text
  lightSubText: "#666",
  darkSubText: "#AAAAAA", // Lighter grey for subtext in dark mode
  lightBorder: "#ddd",
  darkBorder: "#333333",
  lightInputBorder: "#e5e5e5",
  darkInputBorder: "#444444",
  lightRowBorder: "#e8e8e8",
  darkRowBorder: "#333333",
  lightProgressBar: "#e5e5e5",
  darkProgressBar: "#333333",
  danger: "red",
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Set to true for default dark mode

  const [person, setPerson] = useState({
    name: "Rahul",
    email: "rahul@nst.com",
    age: "32",
    height: "170",
    weight: "75",
  });

  const [editFields, setEditFields] = useState(person);

  const [fitness, setFitness] = useState({
    totalWorkouts: 128,
    streakDays: 12,
    minutesThisWeek: 120,
    weeklyGoalMinutes: 150,
    overallProgressPercent: 78,
  });

  // Determine current theme colors
  const currentColors = {
    background: darkMode ? COLORS.darkBackground : COLORS.lightBackground,
    card: darkMode ? COLORS.darkCard : COLORS.lightCard,
    text: darkMode ? COLORS.darkText : COLORS.lightText,
    subText: darkMode ? COLORS.darkSubText : COLORS.lightSubText,
    border: darkMode ? COLORS.darkBorder : COLORS.lightBorder,
    rowBorder: darkMode ? COLORS.darkRowBorder : COLORS.lightRowBorder,
    inputBorder: darkMode ? COLORS.darkInputBorder : COLORS.lightInputBorder,
    progressBar: darkMode ? COLORS.darkProgressBar : COLORS.lightProgressBar,
  };

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
    navigation.navigate("Landing"); // Assuming 'Landing' is your login/intro screen
  };

  const confirmDelete = () => {
    closeModal();
    Alert.alert(
      "Account Deleted",
      "Your account has been permanently deleted and cannot be recovered."
    );
  };

  // Helper function for rendering section cards
  const SectionCard = ({ title, items }) => (
    <View style={[styles.cardWrapper, { backgroundColor: currentColors.card }]}>
      <Text style={[styles.sectionTitle, { color: currentColors.subText }]}>
        {title}
      </Text>

      {items.map((it, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.row,
            {
              borderBottomColor: i < items.length - 1 ? currentColors.rowBorder : "transparent",
            },
          ]}
          onPress={it.onPress}
        >
          <Feather name={it.icon} size={20} color={COLORS.primary} />
          <Text style={[styles.rowLabel, { color: currentColors.text }]}>
            {it.label}
          </Text>
          <Feather name="chevron-right" size={20} color={currentColors.subText} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPopupContent = () => {
    switch (modalType) {
      // PERSONAL INFO --------------------------
      case "personal":
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Personal Information</Text>

            <View style={[styles.inputRow, { borderBottomColor: currentColors.inputBorder }]}>
              <Feather name="user" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                value={editFields.name}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, name: v })
                }
                placeholder="Name"
                placeholderTextColor={currentColors.subText}
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: currentColors.inputBorder }]}>
              <Feather name="mail" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                value={editFields.email}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, email: v })
                }
                placeholder="Email"
                placeholderTextColor={currentColors.subText}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: currentColors.inputBorder }]}>
              <AntDesign name="calendar" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                value={editFields.age}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, age: v })
                }
                placeholder="Age"
                placeholderTextColor={currentColors.subText}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: currentColors.inputBorder }]}>
              <MaterialIcons name="height" size={20} color={COLORS.primary} />
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                value={editFields.height}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, height: v })
                }
                placeholder="Height (cm)"
                placeholderTextColor={currentColors.subText}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputRow, { borderBottomColor: currentColors.inputBorder }]}>
              <MaterialIcons
                name="monitor-weight"
                size={20}
                color={COLORS.primary}
              />
              <TextInput
                style={[styles.input, { color: currentColors.text }]}
                value={editFields.weight}
                onChangeText={(v) =>
                  setEditFields({ ...editFields, weight: v })
                }
                placeholder="Weight (kg)"
                placeholderTextColor={currentColors.subText}
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

      // FITNESS -----------------------------------------
      case "fitness":
        const percent = Math.min(
          100,
          Math.round(
            (fitness.minutesThisWeek / fitness.weeklyGoalMinutes) * 100
          )
        );
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Workout Progress</Text>

            <Text style={[styles.progressLabel, { color: currentColors.text }]}>Total Workouts</Text>
            <Text style={[styles.progressValue, { color: currentColors.text }]}>{fitness.totalWorkouts}</Text>

            <Text style={[styles.progressLabel, { marginTop: 10, color: currentColors.text }]}>Streak</Text>
            <Text style={[styles.progressValue, { color: currentColors.text }]}>{fitness.streakDays} days</Text>

            <Text style={[styles.progressLabel, { marginTop: 10, color: currentColors.text }]}>
              Minutes this week
            </Text>
            <View style={[styles.progressBar, { backgroundColor: currentColors.progressBar }]}>
              <View
                style={[styles.progressFill, { width: `${percent}%` }]}
              />
            </View>
            <Text style={[styles.progressSub, { color: currentColors.subText }]}>
              {fitness.minutesThisWeek}/{fitness.weeklyGoalMinutes} minutes (
              {percent}%)
            </Text>

            <Text style={[styles.progressLabel, { marginTop: 10, color: currentColors.text }]}>
              Overall Progress
            </Text>
            <View style={[styles.progressBar, { backgroundColor: currentColors.progressBar }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${fitness.overallProgressPercent}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressSub, { color: currentColors.subText }]}>
              {fitness.overallProgressPercent}%
            </Text>
          </>
        );

      // NOTIFICATIONS ------------------------------------
      case "notifications":
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Notifications</Text>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: currentColors.text }]}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: currentColors.subText, true: COLORS.primary }}
                thumbColor={COLORS.lightBackground} // Thumb is always bright for contrast
              />
            </View>
          </>
        );

      // UNIT SETTINGS ------------------------------------
      case "units":
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Units</Text>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: currentColors.text }]}>Metric (kg, cm)</Text>
              <Switch
                value={metricUnits}
                onValueChange={setMetricUnits}
                trackColor={{ false: currentColors.subText, true: COLORS.primary }}
                thumbColor={COLORS.lightBackground}
              />
            </View>
          </>
        );

      // APPEARANCE ---------------------------------------
      case "appearance":
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Appearance</Text>
            <View style={styles.optionRow}>
              <Text style={[styles.optionLabel, { color: currentColors.text }]}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: currentColors.subText, true: COLORS.primary }}
                thumbColor={COLORS.lightBackground}
              />
            </View>
          </>
        );

      // LOGOUT -------------------------------------------
      case "logout":
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Confirm Logout</Text>
            <Text style={[styles.modalMsg, { color: currentColors.subText }]}>
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

      // DELETE ACCOUNT ------------------------------------
      case "delete":
        return (
          <>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>Delete Account</Text>
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
    <SafeAreaView style={[styles.safe, { backgroundColor: currentColors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: currentColors.text }]}>Profile & Settings</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: "https://static.vecteezy.com/system/resources/thumbnails/024/183/502/small/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={[styles.editIcon, { borderColor: currentColors.background }]}>
              <AntDesign name="edit" size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: currentColors.text }]}>{person.name}</Text>
          <Text style={[styles.sub, { color: currentColors.subText }]}>{person.email}</Text>
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
            {
              label: "Appearance",
              icon: "moon",
              onPress: () => openModal("appearance"),
            },
          ]}
        />

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: currentColors.border }]}
          onPress={() => openModal("logout")}
        >
          <Text style={[styles.logoutText, { color: currentColors.text }]}>Log Out</Text>
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
          <View style={[styles.modalCard, { backgroundColor: currentColors.background }]}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={closeModal}
            >
              <AntDesign name="close" size={20} color={currentColors.text} />
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
  safe: { flex: 1 }, // Background color applied dynamically
  container: { padding: 20, paddingBottom: 60 },

  headerRow: { alignItems: "center", marginBottom: 16 },
  header: { fontSize: 22, fontWeight: "700" },

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
  },

  name: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  sub: { marginTop: 4 }, // Color applied dynamically

  cardWrapper: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLabel: { marginLeft: 12, fontSize: 16, flex: 1 },

  logoutBtn: {
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { fontSize: 16, fontWeight: "700" },

  deleteText: {
    marginTop: 12,
    textAlign: "center",
    color: COLORS.danger,
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
  },
  modalClose: { position: "absolute", right: 12, top: 12, zIndex: 10 },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalMsg: { fontSize: 14, marginBottom: 12 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  input: { marginLeft: 10, flex: 1, fontSize: 15, paddingVertical: 5 },

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
  optionLabel: { fontSize: 16 },

  progressLabel: { fontSize: 15, marginTop: 8 },
  progressValue: { fontSize: 18, fontWeight: "700" },

  progressBar: {
    height: 10,
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.primary },
  progressSub: { fontSize: 12, marginTop: 5 },
});