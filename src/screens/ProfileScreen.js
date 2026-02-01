import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('nickname, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setNickname(data.nickname || '');
                    setAvatarUrl(data.avatar_url);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setLoading(true);
            if (!currentUser) throw new Error('No user on the session!');

            const updates = {
                id: currentUser.id,
                nickname,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            Alert.alert('Success', 'Profile updated!');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadAvatar(result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert('Error', 'Error picking image');
        }
    }

    async function uploadAvatar(base64Image) {
        try {
            setUploading(true);
            const filePath = `${currentUser.id}/${Date.now()}.png`;
            const contentType = 'image/png';

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64Image), { contentType });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={NB_STYLES.container}>
            <Text style={NB_STYLES.headerTitle}>Edit Profile</Text>

            <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <TouchableOpacity onPress={pickImage} style={{
                    width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee',
                    borderWidth: 3, borderColor: 'black', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <Text style={{ fontSize: 40 }}>👤</Text>
                    )}
                </TouchableOpacity>
                <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Tap to change photo</Text>
            </View>

            <View style={NB_STYLES.card}>
                <Text style={NB_STYLES.label}>Nickname / Display Name</Text>
                <TextInput
                    style={NB_STYLES.input}
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="Enter your nickname"
                />

                <Text style={NB_STYLES.label}>Email (Cannot change)</Text>
                <TextInput
                    style={[NB_STYLES.input, { backgroundColor: '#eee', color: '#666' }]}
                    value={currentUser?.email}
                    editable={false}
                />

                <TouchableOpacity
                    style={[NB_STYLES.btnPrimary, { marginTop: 20 }]}
                    onPress={updateProfile}
                    disabled={uploading || loading}
                >
                    <Text style={NB_STYLES.btnText}>
                        {uploading ? 'UPLOADING...' : loading ? 'SAVING...' : 'SAVE PROFILE'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[NB_STYLES.btnSecondary, { marginTop: 30, backgroundColor: '#000' }]}
                onPress={() => supabase.auth.signOut()}
            >
                <Text style={[NB_STYLES.btnText, { color: '#fff' }]}>SIGN OUT</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
