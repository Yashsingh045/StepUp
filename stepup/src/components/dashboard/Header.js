import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getUser } from '../../utils/storage';

const Header = () => {
    const [userName, setUserName] = useState('User');

    useFocusEffect(
        useCallback(() => {
            const loadUser = async () => {
                const user = await getUser();
                if (user && user.name) {
                    setUserName(user.name);
                }
            };
            loadUser();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>StepUp</Text>
                <Text style={styles.subtitle}>Hey, {userName}</Text>
            </View>
            <View style={styles.avatarContainer}>
                {/* Placeholder for Avatar */}
                <Image
                    source={require('../../../assets/avatar.png')}
                    style={styles.avatar}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingTop: 60, // Adjust for status bar
        paddingBottom: 20,
    },
    title: {
        ...FONTS.largeTitle,
    },
    subtitle: {
        ...FONTS.body,
        marginTop: 4,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.cardDark,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
});

export default Header;
