import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';

export default function HomeScreen({ navigation }) {
    const menus = [
        { title: '🛍️ Marketplace', screen: 'Marketplace', color: '#FFD90F' },
        { title: '🗓️ Events', screen: 'Events', color: '#FF6B6B' },
        { title: '📅 Calendar', screen: 'Calendar', color: '#FFE66D' },
        { title: '📸 Feed', screen: 'Feed', color: '#95E1D3' },
        { title: '🤝 Skill Swap', screen: 'SkillSwap', color: '#A8DADC' },
        { title: '💻 DevMatch', screen: 'PartnerFinder', color: '#457B9D' },
        { title: '💰 Gig Works', screen: 'GigWorks', color: '#4ECDC4' },
        { title: '🎮 Study Break', screen: 'Game', color: '#FF9F1C' },
        { title: '📢 Report Issue', screen: 'ReportIssue', color: '#b75d39ff' },
    ];

    return (
        <ScrollView contentContainerStyle={[NB_STYLES.container, { paddingVertical: 40 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={[NB_STYLES.headerTitle, { marginBottom: 0 }]}>CampusBuzz</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={{
                        width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary,
                        borderWidth: 3, borderColor: 'black', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Text style={{ fontSize: 24 }}>👤</Text>
                </TouchableOpacity>
            </View>

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
        </ScrollView>
    );
}
