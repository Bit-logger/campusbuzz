import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';

// Helper to check for admin (Mock implementation - replace with real role check)
const isAdmin = (user) => {
    // For MVP, checking specific email or just returning true for testing if needed.
    // Replace 'admin@campusbuzz.com' with the actual admin email or logic.
    return user?.email?.includes('admin');
};

export default function CalendarScreen() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start Jan 1, 2026
    const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD'
    const [officialEvents, setOfficialEvents] = useState([]);
    const [personalEvents, setPersonalEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [eventType, setEventType] = useState('personal'); // 'personal' | 'official'
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');

    // Load User
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    // Fetch Events when month changes
    const fetchEvents = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        // Calculate YYYY-MM-DD range strings manually to avoid Timezone shifts
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // 1-12
        const lastDay = new Date(year, month, 0).getDate(); // Last day of month

        const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const endStr = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        console.log("Fetching range:", startStr, "to", endStr);

        // 1. Fetch Official Events (from 'events' table)
        const { data: official, error: offError } = await supabase
            .from('events')
            .select('*')
            .gte('date', startStr)
            .lte('date', endStr);

        if (offError) console.error("Official events error:", offError);
        else setOfficialEvents(official || []);

        // 2. Fetch Personal Events (from 'personal_events' table)
        const { data: personal, error: perError } = await supabase
            .from('personal_events')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startStr)
            .lte('date', endStr);

        if (perError) {
            console.log("Personal events error:", perError.message);
        } else {
            setPersonalEvents(personal || []);
            console.log("Personal fetched:", personal?.length);
        }

        setLoading(false);
    }, [currentDate, user]);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [fetchEvents])
    );

    // Calendar Logic
    const goToNextMonth = () => {
        const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        if (next.getFullYear() > 2027) return; // Limit to 2027
        setCurrentDate(next);
        setSelectedDate(null);
    };

    const goToPrevMonth = () => {
        const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        if (prev.getFullYear() < 2026) return; // Limit to 2026
        setCurrentDate(prev);
        setSelectedDate(null);
    };

    // Performance optimization: Memoize grid days calculation to avoid re-allocating 35+ Date objects on every render.
    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const result = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            result.push(null);
        }
        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            result.push(new Date(year, month, i));
        }
        return result;
    }, [currentDate]);

    const formatDateKey = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Performance optimization: Index events by 'YYYY-MM-DD' date string into an O(1) hash map.
    // Replaces O(N) array .filter() passes executed 35-42 times per grid render (e.g., on every keystroke when typing in modals).
    // Expected Impact: Reduces cell lookup time from O(GridSize * N) to O(1) per cell during re-renders.
    const eventsByDate = useMemo(() => {
        const map = {};
        const addEvent = (e, type) => {
            if (!e || !e.date) return;
            const dateKey = e.date.length >= 10 ? e.date.substring(0, 10) : e.date;
            if (!map[dateKey]) map[dateKey] = { official: [], personal: [] };
            map[dateKey][type].push(e);
        };

        officialEvents.forEach(e => addEvent(e, 'official'));
        personalEvents.forEach(e => addEvent(e, 'personal'));
        return map;
    }, [officialEvents, personalEvents]);

    const EMPTY_EVENTS = useMemo(() => ({ official: [], personal: [] }), []);

    const getEventsForDate = useCallback((dateStr) => {
        if (!dateStr) return EMPTY_EVENTS;
        return eventsByDate[dateStr] || EMPTY_EVENTS;
    }, [eventsByDate, EMPTY_EVENTS]);

    const handleDayPress = (date) => {
        if (!date) return;
        const dateStr = formatDateKey(date);
        setSelectedDate(dateStr);
    };

    const handleAddEvent = async () => {
        if (!newEventTitle.trim()) {
            Alert.alert("Error", "Please enter a title");
            return;
        }

        try {
            // Only 'personal' events allowed for students via app
            const { error } = await supabase.from('personal_events').insert({
                user_id: user.id,
                title: newEventTitle,
                description: newEventDesc,
                date: selectedDate
            });

            if (error) throw error;

            Alert.alert("Success", "Plan added!");
            setModalVisible(false);
            setNewEventTitle('');
            setNewEventDesc('');

            // Force refresh immediately
            fetchEvents();

        } catch (err) {
            Alert.alert("Error", err.message);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        Alert.alert(
            "Delete Plan",
            "Are you sure you want to delete this plan?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('personal_events')
                                .delete()
                                .eq('id', eventId);

                            if (error) throw error;

                            // Immediately remove from local state to feel snappy, then fetch
                            setPersonalEvents(prev => prev.filter(e => e.id !== eventId));
                            fetchEvents();

                        } catch (err) {
                            Alert.alert("Error", "Could not delete event");
                        }
                    }
                }
            ]
        );
    };

    // Rendering
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : { official: [], personal: [] };

    return (
        <View style={NB_STYLES.container}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={goToPrevMonth} style={localStyles.navBtn}>
                    <Text style={localStyles.navBtnText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={NB_STYLES.headerTitle}>{currentMonthName} {currentYear}</Text>
                <TouchableOpacity onPress={goToNextMonth} style={localStyles.navBtn}>
                    <Text style={localStyles.navBtnText}>{'>'}</Text>
                </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <Text key={d} style={localStyles.weekDayText}>{d}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={localStyles.grid}>
                {days.map((date, index) => {
                    if (!date) return <View key={index} style={localStyles.dayCellEmpty} />;

                    const dateStr = formatDateKey(date);
                    const { official, personal } = getEventsForDate(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === formatDateKey(new Date());

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                localStyles.dayCell,
                                isSelected && localStyles.dayCellSelected,
                                isToday && localStyles.dayCellToday
                            ]}
                            onPress={() => handleDayPress(date)}
                        >
                            <Text style={[localStyles.dayNum, isSelected && { color: 'white' }]}>{date.getDate()}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 4, gap: 2 }}>
                                {official.length > 0 && <View style={localStyles.dotOfficial} />}
                                {personal.length > 0 && <View style={localStyles.dotPersonal} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Selected Date Details */}
            {selectedDate && (
                <View style={localStyles.detailsPanel}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={NB_STYLES.subHeader}>Schedule for {selectedDate}</Text>
                    </View>

                    <ScrollView style={{ maxHeight: 200 }}>
                        {selectedEvents.official.length === 0 && selectedEvents.personal.length === 0 && (
                            <Text style={{ fontStyle: 'italic', color: '#666' }}>No events planned.</Text>
                        )}

                        {selectedEvents.official.map((e, i) => (
                            <View key={`off-${i}`} style={[localStyles.eventItem, { borderColor: COLORS.primary }]}>
                                <Text style={{ fontWeight: '900', color: COLORS.primary }}>OFFICIAL</Text>
                                <Text style={{ fontWeight: 'bold' }}>{e.title}</Text>
                                <Text>{e.description}</Text>
                            </View>
                        ))}

                        {selectedEvents.personal.map((e, i) => (
                            <View key={`pers-${i}`} style={[localStyles.eventItem, { borderColor: COLORS.success, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: '900', color: COLORS.success }}>MY PLAN</Text>
                                    <Text style={{ fontWeight: 'bold' }}>{e.title}</Text>
                                    <Text>{e.description}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteEvent(e.id)} style={{ padding: 5 }}>
                                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <TouchableOpacity style={[NB_STYLES.btnPrimary, { flex: 1, backgroundColor: COLORS.success }]} onPress={() => {
                            setEventType('personal');
                            setModalVisible(true);
                        }}>
                            <Text style={NB_STYLES.btnText}>+ Add Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Add Event Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={localStyles.modalContainer}>
                    <View style={localStyles.modalContent}>
                        <Text style={NB_STYLES.headerTitle}>New Personal Plan</Text>
                        <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Date: {selectedDate}</Text>

                        <TextInput
                            style={NB_STYLES.input}
                            placeholder="Title"
                            value={newEventTitle}
                            onChangeText={setNewEventTitle}
                        />
                        <TextInput
                            style={[NB_STYLES.input, { height: 80 }]}
                            placeholder="Description"
                            multiline
                            value={newEventDesc}
                            onChangeText={setNewEventDesc}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                            <TouchableOpacity style={[NB_STYLES.btnSecondary, { flex: 1 }]} onPress={() => setModalVisible(false)}>
                                <Text style={NB_STYLES.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[NB_STYLES.btnPrimary, { flex: 1 }]} onPress={handleAddEvent}>
                                <Text style={NB_STYLES.btnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const localStyles = StyleSheet.create({
    navBtn: {
        padding: 10,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: COLORS.white,
        borderRadius: 4,
        ...NB_STYLES.shadow
    },
    navBtnText: {
        fontSize: 20,
        fontWeight: '900',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    weekDayText: {
        width: '14.28%',
        textAlign: 'center',
        fontWeight: '900',
        marginBottom: 5,
    },
    dayCell: {
        width: '13%',
        margin: '0.64%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    dayCellEmpty: {
        width: '13%',
        margin: '0.64%',
        aspectRatio: 1,
    },
    dayCellSelected: {
        backgroundColor: COLORS.secondary,
    },
    dayCellToday: {
        borderColor: COLORS.primary,
        borderWidth: 3,
    },
    dayNum: {
        fontWeight: 'bold',
        fontSize: 16
    },
    dotOfficial: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary
    },
    dotPersonal: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success
    },
    detailsPanel: {
        marginTop: 20,
        padding: 15,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#fff',
        borderRadius: 4,
        ...NB_STYLES.shadow
    },
    eventItem: {
        padding: 10,
        borderLeftWidth: 4,
        backgroundColor: '#f9f9f9',
        marginBottom: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderWidth: 3,
        borderColor: 'black',
        padding: 20,
        borderRadius: 8,
        ...NB_STYLES.shadow
    }
});
