import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
// Import Picker from appropriate package if needed, or use TextInput for MVP

export default function AddResourceScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('1');
    const [type, setType] = useState('Notes'); // Notes, PYQ, Lab Manual
    const [fileUrl, setFileUrl] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!title || !subject || !fileUrl) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('academic_resources').insert({
                title,
                subject,
                semester: parseInt(semester),
                type,
                file_url: fileUrl,
                uploaded_by: user.id
            });

            if (error) throw error;

            Alert.alert('Success', 'Resource added!');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Unit 1 Notes" />

            <Text style={styles.label}>Subject</Text>
            <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="e.g. Engineering Physics" />

            <Text style={styles.label}>Semester (1-8)</Text>
            <TextInput
                style={styles.input}
                value={semester}
                onChangeText={setSemester}
                keyboardType="numeric"
                placeholder="1"
            />

            <Text style={styles.label}>Type (Notes, PYQ, Manual)</Text>
            <TextInput style={styles.input} value={type} onChangeText={setType} placeholder="Notes" />

            <Text style={styles.label}>PDF Link (Google Drive/Dropbox)</Text>
            <TextInput style={styles.input} value={fileUrl} onChangeText={setFileUrl} placeholder="https://..." autoCapitalize="none" />

            <Button title={loading ? "Uploading..." : "Add Resource"} onPress={handleSubmit} disabled={loading} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
});
