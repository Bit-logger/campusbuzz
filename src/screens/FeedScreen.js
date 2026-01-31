import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NB_STYLES, COLORS } from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function FeedScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [likedPostIds, setLikedPostIds] = useState(new Set()); // Track which posts user liked

    // Comment State
    const [modalVisible, setModalVisible] = useState(false);
    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    }, []);

    async function fetchPosts() {
        setLoading(true);
        // 1. Fetch Posts
        const { data: postsData, error: postsError } = await supabase
            .from('feed_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (postsError) {
            console.error(postsError);
            setLoading(false);
            return;
        }

        // 2. Fetch User's Likes (if logged in)
        if (currentUser) {
            const { data: likesData } = await supabase
                .from('feed_likes')
                .select('post_id')
                .eq('user_id', currentUser.id);

            if (likesData) {
                const ids = new Set(likesData.map(l => l.post_id));
                setLikedPostIds(ids);
            }
        }

        setPosts(postsData || []);
        setLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [currentUser])
    );

    // --- Like Logic ---
    const handleLike = async (post) => {
        if (!currentUser) return;

        const isLiked = likedPostIds.has(post.id);
        const newLikeCount = isLiked ? post.likes_count - 1 : post.likes_count + 1;

        // Optimistic Update
        setPosts(current =>
            current.map(p =>
                p.id === post.id ? { ...p, likes_count: newLikeCount } : p
            )
        );

        setLikedPostIds(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(post.id);
            else next.add(post.id);
            return next;
        });

        try {
            if (isLiked) {
                // UNLIKE: Delete from feed_likes
                await supabase.from('feed_likes').delete().match({ post_id: post.id, user_id: currentUser.id });
                await supabase.from('feed_posts').update({ likes_count: newLikeCount }).eq('id', post.id);
            } else {
                // LIKE: Insert into feed_likes
                const { error } = await supabase.from('feed_likes').insert({ post_id: post.id, user_id: currentUser.id });
                if (error && error.code === '23505') return; // Ignore duplicate key error safely
                await supabase.from('feed_posts').update({ likes_count: newLikeCount }).eq('id', post.id);
            }
        } catch (err) {
            console.error(err);
            // Revert on error? For MVP we skip complex revert logic
        }
    };

    // --- Comment Logic ---
    const openComments = async (postId) => {
        setActivePostId(postId);
        setModalVisible(true);
        setLoadingComments(true);
        setComments([]);

        const { data, error } = await supabase
            .from('feed_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (!error) setComments(data);
        setLoadingComments(false);
    };

    const submitComment = async () => {
        if (!newComment.trim() || !currentUser) return;

        const tempId = Date.now();
        const optimisticComment = {
            id: tempId,
            content: newComment,
            user_email: currentUser.email,
            created_at: new Date().toISOString()
        };

        setComments(prev => [...prev, optimisticComment]);
        setNewComment('');

        const { error } = await supabase.from('feed_comments').insert({
            post_id: activePostId,
            user_id: currentUser.id,
            user_email: currentUser.email,
            content: optimisticComment.content
        });

        if (error) {
            Alert.alert("Error", "Failed to post comment");
            // Remove optimistic comment?
        }
    };

    const renderPost = ({ item }) => {
        const isLiked = likedPostIds.has(item.id);

        return (
            <View style={NB_STYLES.card}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
                        borderWidth: 2, borderColor: 'black', marginRight: 10,
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Text style={{ fontWeight: 'bold' }}>{item.user_email?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.user_email?.split('@')[0]}</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{new Date(item.created_at).toDateString()}</Text>
                    </View>
                </View>

                {/* Image */}
                <Image
                    source={{ uri: item.image_url }}
                    style={{
                        width: '100%', height: 350, backgroundColor: '#f0f0f0',
                        borderWidth: 2, borderColor: 'black', marginBottom: 12
                    }}
                    resizeMode="cover"
                />

                {/* Actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 12 }}>
                    {/* Like Button */}
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => handleLike(item)}
                    >
                        <Text style={{ fontSize: 28, marginRight: 8 }}>{isLiked ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>

                    {/* Comment Button */}
                    <TouchableOpacity onPress={() => openComments(item.id)}>
                        <Text style={{ fontSize: 28 }}>💬</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: '900', fontSize: 16, marginBottom: 5 }}>{item.likes_count} likes</Text>

                {/* Caption */}
                {item.caption && (
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>
                        <Text style={{ fontWeight: 'bold' }}>{item.user_email?.split('@')[0]}</Text> {item.caption}
                    </Text>
                )}

                <TouchableOpacity onPress={() => openComments(item.id)}>
                    <Text style={{ color: '#666', marginTop: 5 }}>View all comments...</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={NB_STYLES.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={NB_STYLES.headerTitle}>Campus Moments</Text>
                <TouchableOpacity
                    style={[NB_STYLES.btnPrimary, { marginBottom: 0, paddingVertical: 8, paddingHorizontal: 12 }]}
                    onPress={() => navigation.navigate('AddPost')}
                >
                    <Text style={[NB_STYLES.btnText, { fontSize: 20 }]}>+</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} />}
                contentContainerStyle={{ paddingBottom: 50 }}
            />

            {/* Comments Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                >
                    <View style={{ backgroundColor: COLORS.background, height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 3, borderColor: 'black' }}>

                        {/* Modal Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 3 }}>
                            <Text style={{ fontSize: 20, fontWeight: '900' }}>Comments</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{ fontSize: 20 }}>❌</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Comments List */}
                        <FlatList
                            data={comments}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={{ padding: 15 }}
                            renderItem={({ item }) => (
                                <View style={{ marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{item.user_email?.split('@')[0]}</Text>
                                    <Text>{item.content}</Text>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>No comments yet.</Text>}
                        />

                        {/* Input Area */}
                        <View style={{ padding: 15, borderTopWidth: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white }}>
                            <TextInput
                                style={[NB_STYLES.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                            />
                            <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={submitComment}>
                                <Text style={NB_STYLES.btnText}>SEND</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
