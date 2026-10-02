import React, { useState } from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../styles/theme';

export default function SquishyButton({
    onPress,
    label,
    style,
    textStyle,
    disabled = false,
    color = COLORS.primary,
    secondary = false,
    children,
    accessibilityLabel,
    accessibilityRole = 'button',
    accessibilityState,
    accessibilityHint
}) {
    // Animation value for the press effect
    const [scaleValue] = useState(new Animated.Value(1));
    const [translateY] = useState(new Animated.Value(0));

    const onPressIn = () => {
        if (disabled) return;
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.95,
                useNativeDriver: true,
                speed: 20,
                bounciness: 10
            }),
            Animated.timing(translateY, {
                toValue: 4, // Move down to simulate press
                duration: 50,
                useNativeDriver: true
            })
        ]).start();
    };

    const onPressOut = () => {
        if (disabled) return;
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 10
            }),
            Animated.timing(translateY, {
                toValue: 0, // Move back up
                duration: 100,
                useNativeDriver: true
            })
        ]).start();
    };

    // Base Styles based on Neo-Brutalism (Hard Borders, Shadows)
    const baseContainerStyle = {
        backgroundColor: secondary ? COLORS.surface : color,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
        // Hard Shadow simulated by view below or just keep flat border for now
        // We will stick to the existing shadow style but handled uniquely
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
            },
            android: {
                borderBottomWidth: 6,
                borderRightWidth: 6,
            },
        }),
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityRole={accessibilityRole}
            accessibilityState={{ disabled, ...accessibilityState }}
            accessibilityHint={accessibilityHint}
        >
            <Animated.View style={[
                baseContainerStyle,
                style,
                {
                    transform: [{ scale: scaleValue }, { translateY: translateY }],
                    // Remove shadow when pressed to simulate being pushed "into" the page
                    // This is a bit tricky with static styles, but the translateY helps
                }
            ]}>
                {children ? children : <Text style={[styles.text, textStyle]}>{label}</Text>}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        fontWeight: '900',
        color: 'black',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
