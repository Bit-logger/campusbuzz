import React, { useRef, useMemo } from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../styles/theme';

function SquishyButton({
    onPress,
    label,
    style,
    textStyle,
    disabled = false,
    color = COLORS.primary,
    secondary = false,
    children,
    accessibilityLabel,
    accessibilityRole
}) {
    // Optimization: Lazy ref initialization avoids instantiating new Animated.Value objects on every render
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

    // Optimization: Memoize base style object to avoid object re-creation and GC pressure on every render
    const baseContainerStyle = useMemo(() => ({
        backgroundColor: secondary ? COLORS.surface : color,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
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
    }), [secondary, color, disabled]);

    return (
        <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled}
            accessible={true}
            accessibilityLabel={accessibilityLabel || (typeof label === 'string' ? label : undefined)}
            accessibilityRole={accessibilityRole || "button"}
        >
            <Animated.View style={[
                baseContainerStyle,
                style,
                {
                    transform: [{ scale: scaleValue }, { translateY: translateY }],
                }
            ]}>
                {children ? children : <Text style={[styles.text, textStyle]}>{label}</Text>}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

// Optimization: Memoize component to avoid re-renders when parent re-renders with unchanged props
export default React.memo(SquishyButton);

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        fontWeight: '900',
        color: 'black',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
