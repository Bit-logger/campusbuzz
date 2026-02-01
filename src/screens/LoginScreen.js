import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [idCardUri, setIdCardUri] = useState(null);

    // New State for Multi-Step Verification
    // 'login' | 'scan_id' | 'pending' | 'rejected'
    const [uiState, setUiState] = useState('login');

    // --- CHECK SESSION ON MOUNT ---
    // If App.js remounts us (because of loading state), we need to recover the state.
    React.useEffect(() => {
        const checkExistingAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.user) {
                // User is already logged in, so why are we here?
                // Must be because of missing ID or Pending approval.
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('approval_status, id_card_url')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    if (!profile.id_card_url) setUiState('scan_id');
                    else if (profile.approval_status === 'PENDING') setUiState('pending');
                    else if (profile.approval_status === 'REJECTED') setUiState('rejected');
                    // If approved, App.js handles it, but maybe we haven't transitioned yet.
                }
            }
        };
        checkExistingAuth();
    }, []);

    // --- ID CARD CAMERA LOGIC ---
    const takeIdCardPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "Camera access is needed to verify your ID.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setIdCardUri(result.assets[0].uri);
        }
    };

    // --- UPLOAD ID LOGIC (Authenticated) ---
    const uploadIdCard = async () => {
        if (!idCardUri) {
            Alert.alert("No Image", "Please scan your ID card first.");
            return;
        }
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user.");

            const fileExt = idCardUri.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // CONVERT TO BASE64 (More reliable in Expo)
            const response = await fetch(idCardUri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from('id_cards')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('id_cards')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ id_card_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            Alert.alert("Verification Submitted", "Your ID has been uploaded. Waiting for Admin Approval.");
            setUiState('pending');

        } catch (err) {
            console.error(err);
            Alert.alert("Upload Error", err.message);
        }
        setLoading(false);
    };

    // --- AUTH LOGIC ---
    async function handleAuth() {
        if (!email || !password) {
            Alert.alert("Missing Fields", "Please enter valid email and password.");
            return;
        }

        setLoading(true);

        if (isSignUpMode) {
            // --- SIGN UP (Step 1: Create Account) ---
            if (!phoneNumber) {
                Alert.alert("Missing Phone", "Please enter your phone number.");
                setLoading(false);
                return;
            }

            // Just create account. No ID upload yet (because no session).
            const { data: { session, user }, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: { data: { phone_number: phoneNumber } }
            });

            if (signUpError) {
                Alert.alert('Sign Up Error', signUpError.message);
            } else {
                Alert.alert('Account Created! 🐝', 'Please check your email to verify your account. Then log in to scan your ID.');
                setIsSignUpMode(false); // Go to login screen
            }

        } else {
            // --- SIGN IN (Step 2: Check Verification) ---
            const { error, data } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                Alert.alert('Sign In Error', error.message);
            } else {
                // Check Status
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('approval_status, id_card_url')
                    .eq('id', data.user.id)
                    .single();

                if (!profile) {
                    // Should rarely happen if trigger works
                    setUiState('login');
                } else if (!profile.id_card_url) {
                    // ID Missing -> Force Upload
                    setUiState('scan_id');
                } else if (profile.approval_status === 'PENDING') {
                    // ID Present, but Pending
                    // Force SignOut so they can't use the app, just see the message
                    await supabase.auth.signOut();
                    setUiState('pending');
                } else if (profile.approval_status === 'REJECTED') {
                    await supabase.auth.signOut();
                    setUiState('rejected');
                }
                // If APPROVED, we do nothing. The main AppNavigator (App.js) sees the session and renders the App.
            }
        }
        setLoading(false);
    }

    // --- RENDER STATES ---

    if (uiState === 'scan_id') {
        return (
            <View style={[NB_STYLES.container, { justifyContent: 'center', padding: 20 }]}>
                <Text style={NB_STYLES.headerTitle}>Verify Identity 🪪</Text>
                <Text style={NB_STYLES.subHeader}>We need to verify you are a student.</Text>

                <TouchableOpacity
                    onPress={takeIdCardPhoto}
                    style={[NB_STYLES.input, { height: 200, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', marginBottom: 20 }]}
                >
                    {idCardUri ? (
                        <Image source={{ uri: idCardUri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                    ) : (
                        <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>📸 TAP TO SCAN ID CARD</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={uploadIdCard} disabled={loading}>
                    <Text style={NB_STYLES.btnText}>{loading ? "UPLOADING..." : "SUBMIT ID"}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (uiState === 'pending') {
        return (
            <View style={[NB_STYLES.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, marginBottom: 20 }}>
                    <Text style={{ fontSize: 40 }}>⏳</Text>
                </View>
                <Text style={NB_STYLES.headerTitle}>Verification Pending</Text>
                <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 30 }}>
                    Your ID has been submitted. The Admin is reviewing your request.
                    {'\n\n'}Check back later!
                </Text>
                <TouchableOpacity style={NB_STYLES.btnSecondary} onPress={() => setUiState('login')}>
                    <Text style={NB_STYLES.btnText}>BACK TO LOGIN</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (uiState === 'rejected') {
        return (
            <View style={[NB_STYLES.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Text style={{ fontSize: 60, marginBottom: 20 }}>🚫</Text>
                <Text style={NB_STYLES.headerTitle}>Access Denied</Text>
                <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 30 }}>
                    Your account request was REJECTED by the Admin.
                </Text>
                <TouchableOpacity style={NB_STYLES.btnSecondary} onPress={() => setUiState('login')}>
                    <Text style={NB_STYLES.btnText}>BACK TO LOGIN</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- DEFAULT LOGIN/SIGNUP UI ---
    return (
        <View style={NB_STYLES.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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

                    {isSignUpMode && (
                        <>
                            <Text style={NB_STYLES.subHeader}>Phone Number</Text>
                            <TextInput
                                onChangeText={(text) => setPhoneNumber(text)}
                                value={phoneNumber}
                                placeholder="+91 98765 43210"
                                keyboardType="phone-pad"
                                style={NB_STYLES.input}
                            />
                        </>
                    )}

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
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        <Text style={NB_STYLES.btnText}>
                            {loading ? "PROCESSING..." : (isSignUpMode ? "CREATE ACCOUNT" : "SIGN IN")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[NB_STYLES.btnSecondary, { marginTop: 10, backgroundColor: 'transparent', borderWidth: 0 }]}
                        onPress={() => setIsSignUpMode(!isSignUpMode)}
                        disabled={loading}
                    >
                        <Text style={[NB_STYLES.btnText, { color: COLORS.text, textDecorationLine: 'underline' }]}>
                            {isSignUpMode ? "Already have an account? Sign In" : "New User? Create Account"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
