import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function AddPostScreen({ navigation }) {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reuse Image Picking Logic
    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    }

    // Reuse Image Upload Logic
    async function uploadImage(userId) {
        if (!image || !image.base64) return null;

        const fileName = `${userId}/${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
            .from('feed_images') // Using the 'feed_images' bucket
            .upload(fileName, decode(image.base64), {
                contentType: 'image/jpeg'
            });

        if (error) {
            console.log('Upload error', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage.from('feed_images').getPublicUrl(fileName);
        return publicUrl;
    }

    async function handleSubmit() {
        if (!image) {
            Alert.alert('Error', 'Please select an image to post.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // 1. Upload Image
            const imageUrl = await uploadImage(user.id);
            if (!imageUrl) throw new Error("Image upload failed");

            // 2. Insert Post
            const { error } = await supabase
                .from('feed_posts')
                .insert({
                    user_id: user.id,
                    user_email: user.email, // Or fetch a username if available
                    caption: caption,
                    image_url: imageUrl,
                    likes_count: 0
                });

            if (error) throw error;

            Alert.alert('Success', 'Moment posted!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={NB_STYLES.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={NB_STYLES.headerTitle}>New Moment</Text>

                <TouchableOpacity onPress={pickImage} style={[NB_STYLES.card, { alignItems: 'center', justifyContent: 'center', height: 300, borderStyle: 'dashed' }]}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>📸</Text>
                            <Text style={{ fontWeight: 'bold', color: '#666' }}>Tap to Select Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={NB_STYLES.subHeader}>Caption</Text>
                <TextInput
                    style={[NB_STYLES.input, { height: 100 }]}
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="What's happening on campus today?"
                    multiline
                />

                <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={handleSubmit} disabled={loading}>
                    <Text style={NB_STYLES.btnText}>{loading ? "POSTING..." : "SHARE MOMENT"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
