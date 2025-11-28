import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.header}>Profile & Settings</Text>
          <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8l-O_GiqDjfP61-si_9jWvvae8_jZBQJLyvuAz_Qm8R4SPOwoTEqqBg0IpPvNLb1WK6Q&usqp=CAU" }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon}>
              <AntDesign name="edit" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Name</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRowWrapper}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>128</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12 days</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>75 kg</Text>
              <Text style={styles.statLabel}>Weight Goal</Text>
            </View>
          </View>
        </View>

        {/* Weekly Goals */}
        <View style={styles.sectionRow}>
          <View style={styles.weeklyCard}>
            <Text style={styles.weekTitle}>Workouts</Text>
            <Text style={styles.weekSub}>3/4</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "75%" }]} />
            </View>
            <Text style={styles.lastWeek}>Last week: 4</Text>
          </View>

          <View style={styles.weeklyCard}>
            <Text style={styles.weekTitle}>Minutes</Text>
            <Text style={styles.weekSub}>120/150</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "80%" }]} />
            </View>
            <Text style={styles.lastWeek}>Last week: 160</Text>
          </View>
        </View>

        {/* ACCOUNT & PREFERENCES CARD */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Account & Preferences</Text>

          {/* Account */}
          <TouchableOpacity style={styles.cardRow}>
            <AntDesign name="user" size={20} color="#6C63FF" style={styles.icon} />
            <Text style={styles.itemText}>Personal Information</Text>
            <AntDesign name="right" size={16} color="#777" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardRow}>
            <MaterialIcons name="fitness-center" size={20} color="#6C63FF" style={styles.icon} />
            <Text style={styles.itemText}>Fitness Profile</Text>
            <AntDesign name="right" size={16} color="#777" style={styles.arrowIcon} />
          </TouchableOpacity>

          {/* Preferences */}
          <TouchableOpacity style={styles.cardRow}>
            <Feather name="bell" size={20} color="#6C63FF" style={styles.icon} />
            <Text style={styles.itemText}>Notifications</Text>
            <AntDesign name="right" size={16} color="#777" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardRow}>
            <MaterialIcons name="straighten" size={20} color="#6C63FF" style={styles.icon} />
            <Text style={styles.itemText}>Units</Text>
            <AntDesign name="right" size={16} color="#777" style={styles.arrowIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardRow}>
            <AntDesign name="eyeo" size={20} color="#6C63FF" style={styles.icon} />
            <Text style={styles.itemText}>Appearance</Text>
            <AntDesign name="right" size={16} color="#777" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 80 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "700" },
  doneText: { color: "#6C63FF", fontSize: 16, fontWeight: "600" },

  profileContainer: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: "#6C63FF", borderRadius: 10, padding: 4, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderColor: '#fff', borderWidth: 1.5 },
  name: { fontSize: 22, fontWeight: "700" },

  statsRowWrapper: { backgroundColor: "#F7F7F8", borderRadius: 15, padding: 15, marginVertical: 25 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statCard: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#777", marginTop: 3 },

  sectionRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
  weeklyCard: { flex: 1, padding: 15, backgroundColor: "#F7F7F8", borderRadius: 12 },
  weekTitle: { fontSize: 16, fontWeight: "600" },
  weekSub: { marginTop: 5, fontSize: 14, fontWeight: "500", color: "#6C63FF" },
  progressBar: { height: 5, backgroundColor: "#ddd", borderRadius: 5, marginTop: 8, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#6C63FF" },
  lastWeek: { marginTop: 5, fontSize: 12, color: "#777" },

  cardContainer: { backgroundColor: "#F7F7F8", borderRadius: 12, padding: 15, marginBottom: 25 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  icon: { marginRight: 12 },
  arrowIcon: { marginLeft: 'auto' },
  itemText: { fontSize: 16 },

  logoutBtn: { marginTop: 20, paddingVertical: 15, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, alignItems: "center" },
  logoutText: { fontSize: 16, fontWeight: "600" },
  deleteText: { marginTop: 20, color: "red", textAlign: "center", fontSize: 16, fontWeight: "600" },
});
