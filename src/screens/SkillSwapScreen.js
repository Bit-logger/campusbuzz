import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function SkillSwapScreen({ navigation }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    }, []);

    async function fetchSkills() {
        setLoading(true);
        const { data, error } = await supabase
            .from('skill_swaps')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setSkills(data || []);
        setLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            fetchSkills();
        }, [])
    );

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Skill",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        const { error } = await supabase.from('skill_swaps').delete().eq('id', id);
                        if (error) Alert.alert("Error", error.message);
                        else fetchSkills();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={NB_STYLES.card}>
            <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={{ fontWeight: '900', color: COLORS.success, fontSize: 16 }}>TEACHING</Text>
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.skill_have}</Text>
                </View>
                {(currentUser && currentUser.id === item.user_id) && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 5 }}>
                        <Text style={{ fontSize: 20 }}>🗑️</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ height: 2, backgroundColor: 'black', marginVertical: 8 }} />

            <View style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontWeight: '900', color: COLORS.secondary, fontSize: 16 }}>LEARNING</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.skill_want}</Text>
            </View>

            {item.description ? (
                <Text style={{ fontStyle: 'italic', marginBottom: 10 }}>"{item.description}"</Text>
            ) : null}

            <View style={{ backgroundColor: '#eee', padding: 8, borderRadius: 4, marginTop: 5 }}>
                <Text style={{ fontWeight: 'bold' }}>📞 {item.contact_info}</Text>
            </View>
        </View>
    );

    return (
        <View style={NB_STYLES.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={NB_STYLES.headerTitle}>Skill Wallet</Text>
                <TouchableOpacity
                    style={[NB_STYLES.btnPrimary, { marginBottom: 0, paddingVertical: 8, paddingHorizontal: 12 }]}
                    onPress={() => navigation.navigate('AddSkill')}
                >
                    <Text style={[NB_STYLES.btnText, { fontSize: 20 }]}>+</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={skills}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSkills} />}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ fontSize: 18, color: '#666' }}>No skills listed yet.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 50 }}
            />
        </View>
    );
}
