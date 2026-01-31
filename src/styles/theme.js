import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
    primary: '#FFD90F',    // Vibrant Yellow
    secondary: '#FF6B6B',  // Soft Red/Pink
    accent: '#4ECDC4',     // Teal/Cyan
    background: '#F7F7F7', // Off-white
    surface: '#FFFFFF',    // White
    text: '#000000',       // Black
    border: '#000000',     // Black
    success: '#95E1D3',    // Mint
    warning: '#FFE66D',    // Light Yellow
    danger: '#FF6B6B',     // Red
};

export const NB_STYLES = StyleSheet.create({
    // Container for screens
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    // Neo-Brutalist Card
    card: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.border,
        marginBottom: 16,
        padding: 16,
        borderRadius: 4, // Slight radius or 0 for strict brutalism
        // Hard Shadow
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
            },
            android: {
                elevation: 0, // Android elevation creates blur, so we might need a workaround for hard shadow visualization or just rely on border
                borderBottomWidth: 6,
                borderRightWidth: 6,
            },
        }),
    },
    // Primary Button
    btnPrimary: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: COLORS.border,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
        // Hard Shadow
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
    btnSecondary: {
        backgroundColor: COLORS.surface,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: COLORS.border,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
        // Hard Shadow
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
    btnText: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.text,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Headings
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: COLORS.border,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
        color: COLORS.text,
    },
    // Inputs
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.border,
        padding: 14,
        fontSize: 16,
        fontWeight: 'bold',
        borderRadius: 4,
        marginBottom: 16,
    },
});
