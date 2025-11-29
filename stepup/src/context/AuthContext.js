import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getRegisteredUsers, saveUser as saveUserSession, getUser as getUserSession } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const savedUser = await getUserSession();
            if (savedUser) {
                setUser(savedUser);
            }
        } catch (e) {
            console.error("Error checking user session:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const existingUsers = await getRegisteredUsers();
            const foundUser = existingUsers.find(u => u.email === email && u.password === password);

            if (foundUser) {
                await saveUserSession(foundUser);
                setUser(foundUser);
                return { success: true, message: "Login successful" };
            } else {
                return { success: false, message: "Invalid email or password" };
            }
        } catch (e) {
            console.error("Error logging in:", e);
            return { success: false, message: "Login failed" };
        }
    };

    const register = async (newUser) => {
        try {
            const existingUsers = await getRegisteredUsers();

            if (existingUsers.some(u => u.email === newUser.email)) {
                return { success: false, message: "User already exists" };
            }

            const newUsers = [...existingUsers, newUser];
            await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(newUsers));

            await saveUserSession(newUser);
            setUser(newUser);

            return { success: true, message: "Registration successful" };
        } catch (e) {
            console.error("Error registering user:", e);
            return { success: false, message: "Registration failed" };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
            setUser(null);
        } catch (e) {
            console.error("Error logging out:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
