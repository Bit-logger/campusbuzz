import React, { useRef, memo } from 'react';
import { TouchableWithoutFeedback, Animated, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../styles/theme';

// PERFORMANCE OPTIMIZATION:
// 1. Used lazy initialization with `useRef` for `Animated.Value` instances to ensure constructor calls
//    `new Animated.Value(...)` only run on initial mount, preventing wasteful object allocations on re-renders.
// 2. Extracted base style object creation and Platform.select out of the render loop into StyleSheet.create,
//    eliminating inline object allocations and style recalculations on every render frame.
// 3. Wrapped with `React.memo` to skip re-renders when parent components update state unless props actually change.
// 4. Forwarded accessibility props (accessibilityLabel, accessibilityRole, accessibilityState, accessibilityHint) to ensure screen reader compatibility.

const SquishyButton = memo(function SquishyButton({
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
    // Lazy ref initialization for Animated.Values to avoid new Animated.Value instantiation on re-renders
    const scaleValueRef = useRef(null);
    if (!scaleValueRef.current) {
        scaleValueRef.current = new Animated.Value(1);
    }
    const scaleValue = scaleValueRef.current;

    const translateYRef = useRef(null);
    if (!translateYRef.current) {
        translateYRef.current = new Animated.Value(0);
    }
    const translateY = translateYRef.current;

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

    const containerBackgroundColor = secondary ? COLORS.surface : color;
    const containerOpacity = disabled ? 0.6 : 1;

    return (
        <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityRole={accessibilityRole}
            accessibilityState={accessibilityState || { disabled }}
            accessibilityHint={accessibilityHint}
        >
            <Animated.View style={[
                styles.baseContainer,
                {
                    backgroundColor: containerBackgroundColor,
                    opacity: containerOpacity,
                    transform: [{ scale: scaleValue }, { translateY: translateY }],
                },
                style,
            ]}>
                {children ? children : <Text style={[styles.text, textStyle]}>{label}</Text>}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
});

export default SquishyButton;

const styles = StyleSheet.create({
    baseContainer: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    text: {
        fontSize: 16,
        fontWeight: '900',
        color: 'black',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
