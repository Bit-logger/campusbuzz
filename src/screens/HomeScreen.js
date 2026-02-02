import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import SquishyButton from '../components/SquishyButton';
import { NB_STYLES, COLORS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
    const menus = [
        { title: 'Marketplace', screen: 'Marketplace', color: '#FFD90F', icon: 'bag-handle-outline' },
        { title: 'Events', screen: 'Events', color: '#FF6B6B', icon: 'calendar-outline' },
        { title: 'Calendar', screen: 'Calendar', color: '#FFE66D', icon: 'school-outline' },
        { title: 'Feed', screen: 'Feed', color: '#95E1D3', icon: 'camera-outline' },
        { title: 'Skill Swap', screen: 'SkillSwap', color: '#A8DADC', icon: 'swap-horizontal-outline' },
        { title: 'DevMatch', screen: 'PartnerFinder', color: '#457B9D', icon: 'people-outline' },
        { title: 'Gig Works', screen: 'GigWorks', color: '#4ECDC4', icon: 'cash-outline' },
        { title: 'Study Break', screen: 'Game', color: '#FF9F1C', icon: 'game-controller-outline' },
        { title: 'Report Issue', screen: 'ReportIssue', color: '#b75d39ff', icon: 'megaphone-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={[NB_STYLES.container, { paddingVertical: 40, paddingBottom: 100 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={[NB_STYLES.headerTitle, { marginBottom: 0 }]}>CampusBuzz</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={{
                        width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary,
                        borderWidth: 3, borderColor: 'black', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Ionicons name="person-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={{ width: '100%', marginBottom: 20 }}>
                {menus.map((menu, index) => (
                    <SquishyButton
                        key={index}
                        style={{ backgroundColor: menu.color, marginBottom: 15, flexDirection: 'row', justifyContent: 'flex-start' }}
                        onPress={() => navigation.navigate(menu.screen)}
                        color={menu.color}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name={menu.icon} size={24} color="black" style={{ marginRight: 10 }} />
                            <Text style={NB_STYLES.btnText}>{menu.title}</Text>
                        </View>
                    </SquishyButton>
                ))}
            </View>
        </ScrollView>
    );
}