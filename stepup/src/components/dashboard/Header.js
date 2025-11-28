import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const Header = () => {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>StepUp</Text>
                <Text style={styles.subtitle}>Hey, Alex</Text>
            </View>
            <View style={styles.avatarContainer}>
                {/* Placeholder for Avatar */}
                <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
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
