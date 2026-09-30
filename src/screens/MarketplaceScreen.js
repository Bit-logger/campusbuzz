import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput, Image, Alert, ScrollView, Modal } from 'react-native';
import { supabase } from '../../lib/supabase';
import SquishyButton from '../components/SquishyButton';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function MarketplaceScreen({ navigation }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All'); // All, Sell, Free
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    async function fetchItems() {
        try {
            setLoading(true);

            // Calculate date 5 days ago
            const fiveDaysAgo = new Date();
            fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

            let query = supabase
                .from('marketplace_items')
                .select('*')
                .gt('created_at', fiveDaysAgo.toISOString()) // Filter out old items
                .order('created_at', { ascending: false });

            if (filter === 'Free') {
                query = query.eq('is_free', true);
            } else if (filter === 'Sell') {
                query = query.eq('is_free', false);
            }

            const { data, error } = await query;

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch items');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchItems();
        // Refresh when navigating back
        const unsubscribe = navigation.addListener('focus', () => {
            fetchItems();
        });
        return unsubscribe;
    }, [navigation, filter]);


    async function markAsSold(id) {
        const { error } = await supabase
            .from('marketplace_items')
            .update({ title: '[SOLD] ' + items.find(i => i.id === id).title }) // Simple visual marker for MVP
            .eq('id', id);

        if (error) Alert.alert('Error', error.message);
        else fetchItems();
    }

    async function handleDelete(id) {
        Alert.alert(
            "Delete Item",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        const { error } = await supabase.from('marketplace_items').delete().eq('id', id);
                        if (error) Alert.alert("Error", error.message);
                        else fetchItems();
                    }
                }
            ]
        );
    }

    const filteredItems = useMemo(() => {
        // Performance optimization: Lowercase query once to avoid O(N) repeated string operations
        const lowerCaseQuery = searchQuery.toLowerCase();
        return items.filter(item =>
            item.title.toLowerCase().includes(lowerCaseQuery) ||
            item.description?.toLowerCase().includes(lowerCaseQuery)
        );
    }, [items, searchQuery]);

    const renderItem = ({ item }) => {
        const isSold = item.title.startsWith('[SOLD]');
        return (
            <View style={[NB_STYLES.card, isSold && { opacity: 0.6 }]}>
                {item.image_url && (
                    <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 200, marginBottom: 12, borderRadius: 4, borderWidth: 2, borderColor: 'black' }} />
                )}
                <Text style={[NB_STYLES.subHeader, { fontSize: 22 }]}>{item.title}</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: item.is_free ? COLORS.success : COLORS.primary, marginBottom: 8 }}>
                    {item.is_free ? 'FREE' : `₹${item.price}`}
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 12, lineHeight: 22 }}>{item.description}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12 }}>📞 {item.contact_info}</Text>

                {(user && item.seller_id === user.id && !isSold) && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SquishyButton
                            style={{ paddingVertical: 8, marginBottom: 0, flex: 1, marginRight: 10 }}
                            onPress={() => markAsSold(item.id)}
                            label="Mark Sold"
                            secondary
                            textStyle={{ fontSize: 12 }}
                        />
                        <SquishyButton
                            style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0 }}
                            onPress={() => handleDelete(item.id)}
                            label="🗑️"
                            textStyle={{ fontSize: 24 }}
                        />
                    </View>
                )}
                {isSold && <Text style={{ fontWeight: '900', color: 'red', textTransform: 'uppercase' }}>❌ SOLD OUT</Text>}
            </View>
        );
    };

    return (
        <View style={NB_STYLES.container}>
            {/* Header */}
            <View style={{ marginBottom: 20 }}>
                <Text style={NB_STYLES.headerTitle}>🛍️ Marketplace</Text>
                <TextInput
                    style={NB_STYLES.input}
                    placeholder="Search items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {['All', 'Sell', 'Free'].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[NB_STYLES.btnSecondary, { flex: 1, backgroundColor: filter === f ? COLORS.primary : COLORS.surface, paddingVertical: 10 }]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[NB_STYLES.btnText, { fontSize: 12 }]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchItems} />}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, fontWeight: 'bold' }}>No items found.</Text>}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <SquishyButton
                style={{ position: 'absolute', bottom: 20, right: 20, borderRadius: 30, width: 60, height: 60, paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center' }}
                onPress={() => navigation.navigate('AddItem')}
                label="+"
                textStyle={{ fontSize: 30 }}
            />
        </View>
    );
}
