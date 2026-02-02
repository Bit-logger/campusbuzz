import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Image, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import SquishyButton from '../components/SquishyButton';
import { NB_STYLES, COLORS } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function PartnerFinderScreen({ navigation }) {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    }, []);

    async function fetchPartners() {
        setLoading(true);
        const { data, error } = await supabase
            .from('project_partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setPartners(data || []);
        setLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            fetchPartners();
        }, [])
    );

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to remove this?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        const { error } = await supabase.from('project_partners').delete().eq('id', id);
                        if (error) Alert.alert("Error", error.message);
                        else fetchPartners();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={NB_STYLES.card}>
            <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 22, fontWeight: '900', textTransform: 'uppercase' }}>{item.project_title}</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.danger, marginTop: 4 }}>
                        LOOKING FOR: {item.looking_for}
                    </Text>
                </View>
                {(currentUser && currentUser.id === item.poster_id) && (
                    <SquishyButton
                        onPress={() => handleDelete(item.id)}
                        style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0 }}
                        label="🗑️"
                        textStyle={{ fontSize: 20 }}
                    />
                )}
            </View>

            <Text style={{ fontSize: 16, lineHeight: 22, marginBottom: 12 }}>{item.description}</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {item.skills_required && item.skills_required.split(',').map((skill, index) => (
                    <View key={index} style={{
                        backgroundColor: COLORS.warning,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderWidth: 2,
                        borderColor: 'black',
                        borderRadius: 4
                    }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{skill.trim()}</Text>
                    </View>
                ))}
            </View>

            <View style={{ backgroundColor: '#eee', padding: 8, borderRadius: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>📧 {item.contact_info}</Text>
            </View>
        </View>
    );

    return (
        <View style={NB_STYLES.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={NB_STYLES.headerTitle}>DevMatch</Text>
                <SquishyButton
                    style={{ marginBottom: 0, paddingVertical: 8, paddingHorizontal: 12, width: 50 }}
                    onPress={() => navigation.navigate('AddPartner')}
                    label="+"
                    textStyle={{ fontSize: 20 }}
                />
            </View>

            <FlatList
                data={partners}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPartners} />}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ fontSize: 18, color: '#666' }}>No projects looking for partners yet.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 50 }}
            />
        </View>
    );
}
