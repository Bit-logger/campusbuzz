import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function EventsScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchEvents() {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true }); // Show nearest events first

        if (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch events");
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchEvents();
    }, []);

    async function registerForEvent(eventId, eventTitle) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('event_registrations')
            .insert({ event_id: eventId, user_id: user.id });

        if (error) {
            if (error.code === '23505') Alert.alert('Already Registered', `You are already going to ${eventTitle}!`);
            else Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', `You are registered for ${eventTitle}! See you there.`);
        }
    }

    const renderItem = ({ item }) => (
        <View style={NB_STYLES.card}>
            {/* Event Poster */}
            {item.image_url ? (
                <Image
                    source={{ uri: item.image_url }}
                    style={{ width: '100%', height: 200, borderRadius: 4, marginBottom: 12, borderWidth: 2, borderColor: 'black' }}
                    resizeMode="cover"
                />
            ) : (
                <View style={{ width: '100%', height: 120, backgroundColor: COLORS.accent, marginBottom: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'black' }}>
                    <Text style={{ fontSize: 40 }}>📅</Text>
                </View>
            )}

            <Text style={{ fontSize: 14, fontWeight: '900', color: COLORS.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                {new Date(item.date).toDateString()}
            </Text>

            <Text style={NB_STYLES.subHeader}>{item.title}</Text>

            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>📍 {item.location}</Text>

            <Text style={{ fontSize: 15, lineHeight: 22, marginBottom: 16 }}>{item.description}</Text>

            <TouchableOpacity
                style={[NB_STYLES.btnPrimary, { backgroundColor: COLORS.success, marginBottom: 0 }]}
                onPress={() => registerForEvent(item.id, item.title)}
            >
                <Text style={NB_STYLES.btnText}>REGISTER NOW 👇</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={NB_STYLES.container}>
            <Text style={NB_STYLES.headerTitle}>Campus Events</Text>

            <FlatList
                data={events}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEvents} />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18, fontWeight: 'bold' }}>No upcoming events.</Text>}
                contentContainerStyle={{ paddingBottom: 50 }}
            />
        </View>
    );
}
