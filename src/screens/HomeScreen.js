import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function HomeScreen({ navigation }) {
    const menus = [
        { title: '🛍️ Marketplace', screen: 'Marketplace', color: '#FFD90F' },
        { title: '📚 Resources', screen: 'Resources', color: '#4ECDC4' },
        { title: '🗓️ Events', screen: 'Events', color: '#FF6B6B' },
        { title: '📅 Calendar', screen: 'Calendar', color: '#FFE66D' },
        { title: '📸 Feed', screen: 'Feed', color: '#95E1D3' },
        { title: '📢 Report Issue', screen: 'ReportIssue', color: '#b75d39ff' },
        { title: '🤝 Skill Swap', screen: 'SkillSwap', color: '#A8DADC' },
        { title: '💻 DevMatch', screen: 'PartnerFinder', color: '#457B9D' },
    ];

    return (
        <ScrollView contentContainerStyle={[NB_STYLES.container, { paddingVertical: 40 }]}>
            <Text style={NB_STYLES.headerTitle}>CampusBuzz</Text>

            <View style={{ width: '100%', marginBottom: 20 }}>
                {menus.map((menu, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[NB_STYLES.btnPrimary, { backgroundColor: menu.color }]}
                        onPress={() => navigation.navigate(menu.screen)}
                    >
                        <Text style={NB_STYLES.btnText}>{menu.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[NB_STYLES.btnSecondary, { backgroundColor: '#000' }]}
                onPress={() => supabase.auth.signOut()}
            >
                <Text style={[NB_STYLES.btnText, { color: '#FFF' }]}>SIGN OUT</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
