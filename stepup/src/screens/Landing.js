import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const images = [
    { id: 1, source: require('../../assets/landing-bg.jpg') },
    { id: 2, source: require('../../assets/landing-bg2.jpg') },
    { id: 3, source: require('../../assets/landing-bg3.jpg') },
];

export default function Landing({ navigation }) {

    const { currentColors, isDarkMode } = useTheme();

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
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

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
                    isDarkMode ? 'rgba(0,20,10,0.85)' : 'rgba(255,255,255,0.4)',
                    isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.7)',
                ]}
                style={styles.gradient}
            >
                <View style={styles.content}>

                    <View style={styles.brandingContainer}>
                        <Text style={[styles.logo, { color: currentColors.text }]}>stepUp</Text>

                        <Text style={[styles.tagline, { color: currentColors.secondaryText }]}>
                            Take Control of Your Fitness
                        </Text>

                        <Text style={[styles.description, { color: currentColors.secondaryText }]}>
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
                                            ? { backgroundColor: currentColors.text, width: 24 }
                                            : { backgroundColor: currentColors.secondaryText }
                                    ]}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                { backgroundColor: currentColors.accent }
                            ]}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.primaryButtonText, { color: currentColors.buttonText }]}>
                                Create Account
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.secondaryButton,
                                { borderColor: currentColors.accent }
                            ]}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryButtonText, { color: currentColors.accent }]}>
                                Log In
                            </Text>
                        </TouchableOpacity>

                        <Text style={[styles.termsText, { color: currentColors.secondaryText }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[styles.termsLink, { color: currentColors.text }]}>
                                Terms of Service
                            </Text> and{'\n'}
                            <Text style={[styles.termsLink, { color: currentColors.text }]}>
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
    },
    tagline: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
        marginBottom: -186,
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
    primaryButton: {
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
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 16,
        width: '100%',
        maxWidth: 280,
        alignSelf: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 40,
    },
    termsLink: {
        textDecorationLine: 'underline',
    },
});
