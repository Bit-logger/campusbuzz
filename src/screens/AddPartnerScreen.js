import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import SquishyButton from '../components/SquishyButton';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function AddPartnerScreen({ navigation }) {
    const [projectTitle, setProjectTitle] = useState('');
    const [lookingFor, setLookingFor] = useState('');
    const [skillsRequired, setSkillsRequired] = useState('');
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!projectTitle || !lookingFor || !skillsRequired || !contactInfo) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('project_partners').insert({
                project_title: projectTitle,
                looking_for: lookingFor,
                skills_required: skillsRequired,
                description,
                contact_info: contactInfo,
                poster_id: user.id
            });

            if (error) throw error;

            Alert.alert('Success', 'Posted successfully!');
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
                <Text style={NB_STYLES.headerTitle}>Find a Partner</Text>

                <Text style={NB_STYLES.subHeader}>Project Title</Text>
                <TextInput style={NB_STYLES.input} value={projectTitle} onChangeText={setProjectTitle} placeholder="e.g. AI Attendance System" />

                <Text style={NB_STYLES.subHeader}>Looking For (Role)</Text>
                <TextInput style={NB_STYLES.input} value={lookingFor} onChangeText={setLookingFor} placeholder="e.g. Frontend Developer" />

                <Text style={NB_STYLES.subHeader}>Skills Required (Comma separated)</Text>
                <TextInput style={NB_STYLES.input} value={skillsRequired} onChangeText={setSkillsRequired} placeholder="e.g. React, Node.js, TensorFlow" />

                <Text style={NB_STYLES.subHeader}>Description</Text>
                <TextInput
                    style={[NB_STYLES.input, { height: 100 }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your project and what the partner will do..."
                    multiline
                />

                <Text style={NB_STYLES.subHeader}>Contact Info</Text>
                <TextInput style={NB_STYLES.input} value={contactInfo} onChangeText={setContactInfo} placeholder="Email, Phone, or GitHub" />

                <SquishyButton
                    onPress={handleSubmit}
                    label={loading ? "Posting..." : "Post Position"}
                    disabled={loading}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
