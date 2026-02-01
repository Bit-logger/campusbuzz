import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function AddGigScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [contact, setContact] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description || !amount || !contact) {
            Alert.alert("Missing Fields", "Please fill in all the details.");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase.from('gig_works').insert({
                user_id: user.id,
                title,
                description,
                amount,
                contact_info: contact
            });

            if (error) throw error;

            Alert.alert("Success", "Gig posted successfully!");
            navigation.goBack();

        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={NB_STYLES.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={NB_STYLES.headerTitle}>Post a Gig Opportunity 💼</Text>

                <View style={NB_STYLES.card}>
                    <Text style={NB_STYLES.subHeader}>Gig Title</Text>
                    <TextInput
                        style={NB_STYLES.input}
                        placeholder="e.g. Need assignment help"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={NB_STYLES.subHeader}>Description</Text>
                    <TextInput
                        style={[NB_STYLES.input, { height: 100 }]}
                        placeholder="Describe the work in detail..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={NB_STYLES.subHeader}>Amount / Budget</Text>
                    <TextInput
                        style={NB_STYLES.input}
                        placeholder="e.g. ₹500 - ₹1000"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    <Text style={NB_STYLES.subHeader}>Contact Details</Text>
                    <TextInput
                        style={NB_STYLES.input}
                        placeholder="Phone number, Email, or Instagram ID"
                        value={contact}
                        onChangeText={setContact}
                    />

                    <TouchableOpacity
                        style={[NB_STYLES.btnPrimary, { marginTop: 10 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={NB_STYLES.btnText}>{loading ? "POSTING..." : "POST GIG"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
