import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function ReportIssueScreen({ navigation }) {
    const [category, setCategory] = useState('Infrastructure'); // Default
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = ['Infrastructure', 'Faculty', 'Cleanliness', 'Other'];

    async function handleSubmit() {
        const trimmedDescription = description.trim();
        const trimmedLocation = location.trim();

        if (!trimmedDescription || !trimmedLocation) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Prevent null pointer exception and verify user session before reporting issue
            if (!user) {
                throw new Error('User not authenticated. Please log in again.');
            }

            const { error } = await supabase.from('issues').insert({
                category,
                description: trimmedDescription,
                location: trimmedLocation,
                reporter_id: user.id
            });

            if (error) throw error;

            Alert.alert('Success', 'Report submitted successfully!');
            navigation.goBack();
        } catch (e) {
            // Fail securely - do not expose raw database errors or stack traces to the user
            const safeErrorMessage = e.message && e.message.includes('User not authenticated')
                ? e.message
                : 'Failed to submit issue report. Please try again.';
            Alert.alert('Error', safeErrorMessage);
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
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Text style={NB_STYLES.headerTitle}>Report Issue</Text>

                <Text style={NB_STYLES.subHeader}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                localStyles.categoryBtn,
                                category === cat && localStyles.categoryBtnActive
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[
                                localStyles.categoryText,
                                category === cat && { color: 'white' }
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={NB_STYLES.subHeader}>Location</Text>
                <TextInput
                    style={NB_STYLES.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="e.g. Block A, Room 301"
                />

                <Text style={NB_STYLES.subHeader}>Description</Text>
                <TextInput
                    style={[NB_STYLES.input, { height: 120 }]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholder="Describe the problem..."
                />

                <TouchableOpacity
                    style={[NB_STYLES.btnPrimary, { backgroundColor: COLORS.danger }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={NB_STYLES.btnText}>{loading ? "Submitting..." : "Submit Report"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const localStyles = StyleSheet.create({
    categoryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: COLORS.surface
    },
    categoryBtnActive: {
        backgroundColor: COLORS.secondary,
        borderColor: 'black',
    },
    categoryText: {
        fontWeight: 'bold',
        fontSize: 14
    }
});
