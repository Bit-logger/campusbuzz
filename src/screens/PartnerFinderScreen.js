import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function PartnerFinderScreen({ navigation }) {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const renderItem = ({ item }) => (
        <View style={NB_STYLES.card}>
            <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', textTransform: 'uppercase' }}>{item.project_title}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.danger, marginTop: 4 }}>
                    LOOKING FOR: {item.looking_for}
                </Text>
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
                <TouchableOpacity
                    style={[NB_STYLES.btnPrimary, { marginBottom: 0, paddingVertical: 8, paddingHorizontal: 12 }]}
                    onPress={() => navigation.navigate('AddPartner')}
                >
                    <Text style={[NB_STYLES.btnText, { fontSize: 20 }]}>+</Text>
                </TouchableOpacity>
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
