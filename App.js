import 'react-native-url-polyfill/auto';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { supabase } from './lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import EventsScreen from './src/screens/EventsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import FeedScreen from './src/screens/FeedScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import SkillSwapScreen from './src/screens/SkillSwapScreen';
import AddSkillScreen from './src/screens/AddSkillScreen';
import PartnerFinderScreen from './src/screens/PartnerFinderScreen';
import AddPartnerScreen from './src/screens/AddPartnerScreen';
import AddPostScreen from './src/screens/AddPostScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD700' }}>
        <Text style={{ fontSize: 40, fontWeight: '900' }}>🐝 CampusBuzz</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Sell Item' }} />
            <Stack.Screen name="Resources" component={ResourcesScreen} options={{ title: 'Academic Hub' }} />
            <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'Campus Events' }} />
            <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Academic Calendar' }} />
            <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Campus Moments' }} />
            <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ title: 'Report an Issue' }} />
            <Stack.Screen name="SkillSwap" component={SkillSwapScreen} options={{ title: 'Skill Swap' }} />
            <Stack.Screen name="AddSkill" component={AddSkillScreen} options={{ title: 'List a Skill' }} />
            <Stack.Screen name="PartnerFinder" component={PartnerFinderScreen} options={{ title: 'DevMatch' }} />
            <Stack.Screen name="AddPartner" component={AddPartnerScreen} options={{ title: 'Post Position' }} />
            <Stack.Screen name="AddPost" component={AddPostScreen} options={{ title: 'Share Moment' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
