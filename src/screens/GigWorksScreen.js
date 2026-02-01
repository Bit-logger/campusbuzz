import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function GigWorksScreen({ navigation }) {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchGigs();
            getCurrentUser();
        }, [])
    );

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };

    const fetchGigs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('gig_works')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            Alert.alert('Error', 'Could not load gigs.');
        } else {
            setGigs(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Gig",
            "Are you sure you want to remove this gig?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        const { error } = await supabase.from('gig_works').delete().eq('id', id);
                        if (error) Alert.alert("Error", error.message);
                        else {
                            Alert.alert("Success", "Gig deleted.");
                            fetchGigs();
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={NB_STYLES.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                    <Text style={[NB_STYLES.headerTitle, { fontSize: 20 }]}>{item.title}</Text>
                    <Text style={{ fontSize: 18, color: COLORS.primary, fontWeight: 'bold', marginVertical: 5 }}>💰 {item.amount}</Text>
                </View>
                {userId === item.user_id && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 5 }}>
                        <Ionicons name="trash-outline" size={24} color="red" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={{ fontSize: 16, color: COLORS.text, marginVertical: 10 }}>{item.description}</Text>

            <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 5 }}>
                <Text style={{ fontSize: 14, color: '#666', fontWeight: 'bold' }}>📞 Contact:</Text>
                <Text style={{ fontSize: 16, color: COLORS.text }}>{item.contact_info}</Text>
            </View>
        </View>
    );

    return (
        <View style={NB_STYLES.container}>
            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={gigs}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18, color: '#999' }}>No active gigs found.</Text>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddGig')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    }
});
