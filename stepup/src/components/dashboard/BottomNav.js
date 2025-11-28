import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = () => {
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="grid" size={24} color={COLORS.primaryBlue} />
                    <Text style={[styles.tabLabel, { color: COLORS.primaryBlue }]}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="pulse" size={24} color={COLORS.textGray} />
                    <Text style={styles.tabLabel}>Workouts</Text>
                </TouchableOpacity>

                <View style={styles.placeholder} />

                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="stats-chart" size={24} color={COLORS.textGray} />
                    <Text style={styles.tabLabel}>Progress</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="person" size={24} color={COLORS.textGray} />
                    <Text style={styles.tabLabel}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={32} color={COLORS.textWhite} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90, // Include safe area
        backgroundColor: '#000',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000', // Or slightly lighter if needed
        height: 60,
        paddingHorizontal: 20,
        borderTopWidth: 0.5,
        borderTopColor: '#333',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        color: COLORS.textGray,
    },
    placeholder: {
        width: 60, // Space for FAB
    },
    fab: {
        position: 'absolute',
        top: -30,
        left: '50%',
        marginLeft: -30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primaryBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default BottomNav;
