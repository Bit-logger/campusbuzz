import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
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
        <ScrollView style={NB_STYLES.container}>
            <Text style={NB_STYLES.headerTitle}>List a Skill</Text>

            <Text style={NB_STYLES.subHeader}>I can teach... (Skill Have)</Text>
            <TextInput style={NB_STYLES.input} value={skillHave} onChangeText={setSkillHave} placeholder="e.g. Guitar, Python" />

            <Text style={NB_STYLES.subHeader}>I want to learn... (Skill Want)</Text>
            <TextInput style={NB_STYLES.input} value={skillWant} onChangeText={setSkillWant} placeholder="e.g. Spanish, React Native" />

            <Text style={NB_STYLES.subHeader}>Details</Text>
            <TextInput
                style={[NB_STYLES.input, { height: 100 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Briefly describe your skill level or availability..."
                multiline
            />

            <Text style={NB_STYLES.subHeader}>Contact Info</Text>
            <TextInput style={NB_STYLES.input} value={contactInfo} onChangeText={setContactInfo} placeholder="Phone or Social Handle" />

            <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={handleSubmit} disabled={loading}>
                <Text style={NB_STYLES.btnText}>{loading ? "Listing..." : "List Skill"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
