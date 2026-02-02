import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function AddItemScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [isFree, setIsFree] = useState(false);
    const [contactInfo, setContactInfo] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

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

    async function uploadImage(userId) {
        if (!image || !image.base64) return null;

        const fileName = `${userId}/${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
            .from('marketplace_images')
            .upload(fileName, decode(image.base64), {
                contentType: 'image/jpeg'
            });

        if (error) {
            console.log('Upload error', error);
            return null; // Fail gracefully for now
        }

        const { data: { publicUrl } } = supabase.storage.from('marketplace_images').getPublicUrl(fileName);
        return publicUrl;
    }

    async function handleSubmit() {
        if (!title || !contactInfo || (!isFree && !price)) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // 1. Upload Image if exists
            let imageUrl = null;
            if (image) {
                imageUrl = await uploadImage(user.id);
                if (!imageUrl) Alert.alert("Warning", "Image upload failed, posting without image.");
            }

            // 2. Insert Item
            const { error } = await supabase
                .from('marketplace_items')
                .insert({
                    title,
                    description,
                    price: isFree ? 0 : parseFloat(price),
                    is_free: isFree,
                    contact_info: contactInfo,
                    seller_id: user.id,
                    image_url: imageUrl
                });

            if (error) throw error;

            Alert.alert('Success', 'Item posted successfully!');
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={NB_STYLES.headerTitle}>Sell Item</Text>

                <TouchableOpacity onPress={pickImage} style={[NB_STYLES.card, { alignItems: 'center', justifyContent: 'center', height: 150, borderStyle: 'dashed' }]}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <Text style={{ fontWeight: 'bold', color: '#666' }}>+ Add Photo (Optional)</Text>
                    )}
                </TouchableOpacity>

                <Text style={NB_STYLES.subHeader}>Item Details</Text>
                <TextInput style={NB_STYLES.input} value={title} onChangeText={setTitle} placeholder="Item Name *" />
                <TextInput style={NB_STYLES.input} value={description} onChangeText={setDescription} placeholder="Description" multiline />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Is this Free?</Text>
                    <Switch value={isFree} onValueChange={setIsFree} />
                </View>

                {!isFree && (
                    <TextInput
                        style={NB_STYLES.input}
                        value={price}
                        onChangeText={setPrice}
                        placeholder="Price (₹) *"
                        keyboardType="numeric"
                    />
                )}

                <TextInput
                    style={NB_STYLES.input}
                    value={contactInfo}
                    onChangeText={setContactInfo}
                    placeholder="Phone / Room No *"
                />

                <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={handleSubmit} disabled={loading}>
                    <Text style={NB_STYLES.btnText}>{loading ? "POSTING..." : "POST ITEM"}</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
