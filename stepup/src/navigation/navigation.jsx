import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";

// Screens
import Login from "../screens/login";
import Dashboard from "../screens/dashboard";
import Workouts from "../screens/workouts";
import Profile from "../screens/profile";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen 
        name="Workouts" 
        component={Workouts}
        options={{ tabBarLabel: "Workouts" }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
