import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigation.replace("Home");
    } else {
      Alert.alert("Error", result.message);
      setPassword(""); // Clear password on failure
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={FONTS.largeTitle}>Welcome Back</Text>
            <Text style={[FONTS.body, { marginTop: 10 }]}>
              Sign in to continue your fitness journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={FONTS.body}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
    padding: SIZES.padding * 2,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.h2,
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.textWhite,
  },
  input: {
    backgroundColor: COLORS.cardDark,
    borderRadius: SIZES.radius,
    padding: 16,
    color: COLORS.textWhite,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  loginButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.radius,
    padding: 18,
    alignItems: "center",
    marginTop: 20,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    ...FONTS.h2,
    color: COLORS.textWhite,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  registerText: {
    ...FONTS.body,
    color: COLORS.primaryBlue,
    fontWeight: "bold",
  },
});
