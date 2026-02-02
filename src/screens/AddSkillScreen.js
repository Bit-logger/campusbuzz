import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function AddSkillScreen({ navigation }) {
    const [skillHave, setSkillHave] = useState('');
    const [skillWant, setSkillWant] = useState('');
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!skillHave || !skillWant || !contactInfo) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('skill_swaps').insert({
                skill_have: skillHave,
                skill_want: skillWant,
                description,
                contact_info: contactInfo,
                user_id: user.id
            });

            if (error) throw error;

            Alert.alert('Success', 'Skill listed!');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', e.message);
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
                <Text style={NB_STYLES.headerTitle}>List a Skill</Text>

                <Text style={NB_STYLES.subHeader}>I can teach... (Skill Have)</Text>
                <TextInput style={NB_STYLES.input} value={skillHave} onChangeText={setSkillHave} placeholder="e.g. Python, Guitar, Photography" />

                <Text style={NB_STYLES.subHeader}>I want to learn... (Skill Want)</Text>
                <TextInput style={NB_STYLES.input} value={skillWant} onChangeText={setSkillWant} placeholder="e.g. React Native, Spanish, Cooking" />

                <Text style={NB_STYLES.subHeader}>Details</Text>
                <TextInput
                    style={[NB_STYLES.input, { height: 100 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Briefly describe your experience level or schedule availability..."
                    multiline
                />

                <Text style={NB_STYLES.subHeader}>Contact Info</Text>
                <TextInput style={NB_STYLES.input} value={contactInfo} onChangeText={setContactInfo} placeholder="Phone number or Social Handle" />

                <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={handleSubmit} disabled={loading}>
                    <Text style={NB_STYLES.btnText}>{loading ? "Listing..." : "List Skill"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
