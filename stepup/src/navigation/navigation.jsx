import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Screens
import Login from "../screens/login";
import Dashboard from "../screens/dashboard";
import Workouts from "../screens/workouts";
import Profile from "../screens/profile";
import AddWorkout from "../screens/addworkout";
import Progress from "../screens/progress";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Floating Add Button Component
const AddButton = ({ children, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonInner}>{children}</View>
    </TouchableOpacity>
  );
};

function BottomTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#111",
          height: 70,
        },
        tabBarActiveTintColor: "#4C9FFF",
      }}
    >
      {/* Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={30}
              color={color}
            />
          ),
        }}
      />

      {/* Workouts */}
      <Tab.Screen
        name="Workouts"
        component={Workouts}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={30}
              color={color}
            />
          ),
        }}
      />

      {/* Middle + Button */}
      <Tab.Screen
        name="AddWorkout"
        component={AddWorkout}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <AddButton
              {...props}
              onPress={() => navigation.navigate("AddWorkout")}
            >
              <Ionicons name="add" size={36} color="#fff" />
            </AddButton>
          ),
        }}
      />

      {/* Progress */}
      <Tab.Screen
        name="Progress"
        component={Progress}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bar" size={30} color={color} />
          ),
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={30} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInner: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: "#4C9FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
