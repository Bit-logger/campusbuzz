import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Sign In Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Sign Up Error', error.message);
        if (!session && !error) Alert.alert('Check your email', 'We sent you a verification link!');
        setLoading(false);
    }

    return (
        <View style={NB_STYLES.container}>
            <View style={{ marginTop: 60, marginBottom: 40, alignItems: 'center' }}>
                <View style={{
                    width: 80, height: 80, backgroundColor: COLORS.primary,
                    borderRadius: 40, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 3, borderColor: 'black', marginBottom: 20
                }}>
                    <Text style={{ fontSize: 40 }}>🐝</Text>
                </View>
                <Text style={[NB_STYLES.headerTitle, { fontSize: 36, textAlign: 'center' }]}>CampusBuzz</Text>
                <Text style={{ fontSize: 16, fontStyle: 'italic', fontWeight: 'bold' }}>The Ultimate Campus Companion</Text>
            </View>

            <View style={NB_STYLES.card}>
                <Text style={NB_STYLES.subHeader}>Student Email</Text>
                <TextInput
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                    style={NB_STYLES.input}
                />

                <Text style={NB_STYLES.subHeader}>Password</Text>
                <View style={{ marginBottom: 20, position: 'relative' }}>
                    <TextInput
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={!isPasswordVisible}
                        placeholder="Password"
                        autoCapitalize={'none'}
                        style={[NB_STYLES.input, { marginBottom: 0 }]}
                    />
                    <TouchableOpacity
                        style={{ position: 'absolute', right: 10, top: 12 }}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Text style={{ fontSize: 20 }}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={NB_STYLES.btnPrimary}
                    onPress={() => signInWithEmail()}
                    disabled={loading}
                >
                    <Text style={NB_STYLES.btnText}>{loading ? "BUZZING IN..." : "SIGN IN"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[NB_STYLES.btnSecondary, { marginTop: 10 }]}
                    onPress={() => signUpWithEmail()}
                    disabled={loading}
                >
                    <Text style={NB_STYLES.btnText}>NEW USER? SIGN UP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
