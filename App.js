import 'react-native-url-polyfill/auto';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './lib/supabase';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import AddItemScreen from './src/screens/AddItemScreen';

import GigWorksScreen from './src/screens/GigWorksScreen';
import AddGigScreen from './src/screens/AddGigScreen';
import EventsScreen from './src/screens/EventsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import FeedScreen from './src/screens/FeedScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import SkillSwapScreen from './src/screens/SkillSwapScreen';
import AddSkillScreen from './src/screens/AddSkillScreen';
import PartnerFinderScreen from './src/screens/PartnerFinderScreen';
import AddPartnerScreen from './src/screens/AddPartnerScreen';
import AddPostScreen from './src/screens/AddPostScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GameScreen from './src/screens/GameScreen';
import { NB_STYLES, COLORS } from './src/styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'approved' | 'pending' | 'rejected' | 'missing_id'

  useEffect(() => {
    // 1. Get Initial Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserProfile(session.user.id);
      else {
        setAuthStatus('guest');
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserProfile(session.user.id);
      } else {
        setAuthStatus('guest');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUserProfile(userId) {
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('approval_status, id_card_url')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!profile) {
        // If profile is missing (e.g. database washed but user has session), force logout
        console.log("Profile missing, signing out...");
        await supabase.auth.signOut();
        setAuthStatus('guest');
        return;
      }

      if (!profile.id_card_url) {
        setAuthStatus('missing_id');
      } else if (profile.approval_status === 'PENDING') {
        setAuthStatus('pending');
      } else if (profile.approval_status === 'REJECTED') {
        setAuthStatus('rejected');
      } else {
        setAuthStatus('approved');
      }
    } catch (err) {
      console.error("Profile Check Error:", err);
      // Fallback: If network error or other issue
      setAuthStatus('guest');
    }
    setLoading(false);
  }

  // --- GATEKEEPER UI SCREENS ---

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD700' }}>
        <Text style={{ fontSize: 40, fontWeight: '900' }}>🐝 CampusBuzz</Text>
        <Text style={{ marginTop: 20 }}>Checking Access...</Text>
      </View>
    );
  }

  // If user is logged in but BLOCKED by security rules:
  if (session && authStatus !== 'approved') {
    // We reuse the logic from LoginScreen, but globally here to prevent bypass.
    // Ideally, we could pass this state back to LoginScreen, but since App.js controls the root,
    // we render the blocking screens here directly for maximum security.

    if (authStatus === 'pending') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, marginBottom: 20 }}>
            <Text style={{ fontSize: 40 }}>⏳</Text>
          </View>
          <Text style={NB_STYLES.headerTitle}>Verification Pending</Text>
          <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 30 }}>
            Your ID has been submitted. The Admin is reviewing your request.{'\n\n'}Check back later!
          </Text>
          <TouchableOpacity
            style={NB_STYLES.btnSecondary}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={NB_STYLES.btnText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (authStatus === 'rejected') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background }}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>🚫</Text>
          <Text style={NB_STYLES.headerTitle}>Access Denied</Text>
          <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 30 }}>
            Your account request was REJECTED by the Admin.
          </Text>
          <TouchableOpacity
            style={NB_STYLES.btnSecondary}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={NB_STYLES.btnText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (authStatus === 'missing_id') {
      // If ID is missing, we actually WANT them to go to LoginScreen (which has the Scanner Logic).
      // But wait, LoginScreen is inside the "Guest" stack usually. 
      // Trick: We render LoginScreen specifically, but we might pass a prop or trust its internal check?
      // Actually, LoginScreen's internal check `uiState` logic handles `scan_id`.
      // BUT, since `session` exists, `Stack.Navigator` matches the FIRST block below...
      // WAIT! I must change the Navigator logic to only show Home IF authStatus === 'approved'.
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user && authStatus === 'approved' ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Sell Item' }} />
            <Stack.Screen name="GigWorks" component={GigWorksScreen} options={{ title: 'Gig Works' }} />
            <Stack.Screen name="AddGig" component={AddGigScreen} options={{ title: 'New Gig' }} />
            <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'Campus Events' }} />
            <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Academic Calendar' }} />
            <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Campus Moments' }} />
            <Stack.Screen name="ReportIssue" component={ReportIssueScreen} options={{ title: 'Report an Issue' }} />
            <Stack.Screen name="SkillSwap" component={SkillSwapScreen} options={{ title: 'Skill Swap' }} />
            <Stack.Screen name="AddSkill" component={AddSkillScreen} options={{ title: 'List a Skill' }} />
            <Stack.Screen name="PartnerFinder" component={PartnerFinderScreen} options={{ title: 'DevMatch' }} />
            <Stack.Screen name="AddPartner" component={AddPartnerScreen} options={{ title: 'Post Position' }} />
            <Stack.Screen name="AddPost" component={AddPostScreen} options={{ title: 'Share Moment' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false }} />
          </>
        ) : (
          /* Render LoginScreen for Guest OR if Verification is needed (Missing ID) */
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
