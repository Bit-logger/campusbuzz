import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://xascbyxzwmnmhecwkjle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc2NieXh6d21ubWhlY3dramxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODk4NDAsImV4cCI6MjA4NTE2NTg0MH0.p33_4Nj3Igqp9i7f4u30f7iM7mYC8qw9XUI9pNTFZO8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
