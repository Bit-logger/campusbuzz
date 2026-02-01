import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, ScrollView, RefreshControl, Modal, TextInput, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function EventsScreen() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form and Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        rollNo: '',
        branch: '',
        year: '',
        phone: ''
    });

    async function fetchEvents() {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

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

    const openRegistrationForm = (event) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    const submitRegistration = async () => {
        if (!formData.name || !formData.rollNo || !formData.phone) {
            Alert.alert("Missing Details", "Please fill in all required fields.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('event_registrations')
            .insert({
                event_id: selectedEvent.id,
                user_id: user.id,
                student_name: formData.name,
                roll_no: formData.rollNo,
                branch: formData.branch,
                year: formData.year,
                phone_number: formData.phone
            });

        if (error) {
            if (error.code === '23505') Alert.alert('Already Registered', `You are already going to ${selectedEvent.title}!`);
            else Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', `You are registered for ${selectedEvent.title}! See you there.`);
            setModalVisible(false);
            setFormData({ name: '', rollNo: '', branch: '', year: '', phone: '' }); // Reset form
        }
    };

    const renderItem = ({ item }) => (
        <View style={NB_STYLES.card}>
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
                onPress={() => openRegistrationForm(item)}
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

            {/* Registration Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={[NB_STYLES.subHeader, { textAlign: 'center', marginBottom: 20 }]}>
                            Register for {selectedEvent?.title}
                        </Text>

                        <TextInput
                            placeholder="Full Name *"
                            style={NB_STYLES.input}
                            value={formData.name}
                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                        />
                        <TextInput
                            placeholder="Roll Number *"
                            style={NB_STYLES.input}
                            value={formData.rollNo}
                            onChangeText={(t) => setFormData({ ...formData, rollNo: t })}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput
                                placeholder="Branch (e.g. CSE)"
                                style={[NB_STYLES.input, { width: '48%' }]}
                                value={formData.branch}
                                onChangeText={(t) => setFormData({ ...formData, branch: t })}
                            />
                            <TextInput
                                placeholder="Year (e.g. 3rd)"
                                style={[NB_STYLES.input, { width: '48%' }]}
                                value={formData.year}
                                onChangeText={(t) => setFormData({ ...formData, year: t })}
                            />
                        </View>
                        <TextInput
                            placeholder="Phone Number *"
                            style={NB_STYLES.input}
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(t) => setFormData({ ...formData, phone: t })}
                        />

                        <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={submitRegistration}>
                            <Text style={NB_STYLES.btnText}>CONFIRM REGISTRATION</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', textDecorationLine: 'underline' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: '90%',
        backgroundColor: COLORS.background,
        padding: 20,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: 'black',
        elevation: 10
    }
});
