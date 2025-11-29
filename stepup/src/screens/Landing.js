import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    StatusBar,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const C = {
    BG_PRIMARY: "#121212",
    CARD_BG: "#1E1E1E",
    TEXT_LIGHT: "#FFFFFFE6",
    TEXT_MUTED: "#AAAAAA",
    BORDER: "#333333",
    PROGRESS_BG: "#444444",
    PRIMARY_ACCENT: "#6C63FF",
    ORANGE_ACCENT: "#FF8C00",
    SUCCESS_ACCENT: "#00C853",
    REST_DAY_ACCENT: "#F08080",
    WHITE: "#FFFFFF",
    BLACK: "#000000",
};

const images = [
    { id: 1, source: require('../../assets/landing-bg.jpg') },
    { id: 2, source: require('../../assets/landing-bg2.jpg') },
    { id: 3, source: require('../../assets/landing-bg3.jpg') },
];

export default function Landing({ navigation }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        let isMounted = true;

        const startAnimation = () => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished || !isMounted) return;

                setCurrentImageIndex(prevIndex =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1
                );

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }).start();
            });
        };

        const timer = setInterval(() => {
            if (isMounted) startAnimation();
        }, 3500);

        const initialTimer = setTimeout(() => {
            if (isMounted) startAnimation();
        }, 3500);

        return () => {
            isMounted = false;
            clearInterval(timer);
            clearTimeout(initialTimer);
        };
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Animated.View style={[styles.backgroundContainer, { opacity: fadeAnim }]}>
                <ImageBackground
                    source={images[currentImageIndex]?.source}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
            </Animated.View>

            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(0,20,10,0.85)',
                    'rgba(0,0,0,0.8)',
                    'rgba(0,20,10,0.85)',
                    'rgba(0,0,0,0.8)',
                ]}
                style={styles.gradient}
            >
                <View style={styles.content}>

                    <View style={styles.brandingContainer}>
                        <Text style={styles.logo}>stepUp</Text>

                        <Text style={styles.tagline}>
                            Take Control of Your Fitness
                        </Text>

                        <Text style={styles.description}>
                            The ultimate tool for manually logging every lift,{'\n'}
                            run, and workout. Track your progress, your way.
                        </Text>
                    </View>

                    <View style={styles.bottomSection}>
                        <View style={styles.pageIndicator}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        index === currentImageIndex
                                            ? styles.activeDot
                                            : styles.inactiveDot
                                    ]}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>
                                Create Account
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Log In
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.termsLink}>
                                Terms of Service
                            </Text> and{'\n'}
                            <Text style={styles.termsLink}>
                                Privacy Policy
                            </Text>.
                        </Text>
                    </View>

                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    brandingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 56,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -1,
        color: COLORS.text,
    },
    tagline: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
        color: COLORS.secondaryText,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
        marginBottom: -186,
        color: COLORS.secondaryText,
    },
    bottomSection: {
        width: '100%',
        marginTop: -150,
    },
    pageIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.text,
        width: 24,
    },
    inactiveDot: {
        backgroundColor: COLORS.secondaryText,
    },
    primaryButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
        maxWidth: 280,
        alignSelf: 'center',
        elevation: 5,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: COLORS.buttonText,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.accent,
        marginBottom: 16,
        width: '100%',
        maxWidth: 280,
        alignSelf: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
        color: COLORS.accent,
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 40,
        color: COLORS.secondaryText,
    },
    termsLink: {
        textDecorationLine: 'underline',
        color: COLORS.text,
    },
});