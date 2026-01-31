import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AddEventScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(''); // Simple text input for MVP (YYYY-MM-DD)
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!title || !date || !location) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('events').insert({
                title,
                description,
                date,
                location,
                organizer_id: user.id
            });

            if (error) throw error;

            Alert.alert('Success', 'Event created!');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Tech Fest 2024" />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-03-15" />

            <Text style={styles.label}>Location *</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Auditorium" />

            <Button title={loading ? "Creating..." : "Create Event"} onPress={handleSubmit} disabled={loading} />
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
