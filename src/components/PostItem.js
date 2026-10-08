import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { NB_STYLES, COLORS } from '../styles/theme';

const PostItem = memo(({ item, isLiked, currentUser, onLike, onDelete, onOpenComments }) => {
    return (
        <View style={NB_STYLES.card}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
                        borderWidth: 2, borderColor: 'black', marginRight: 10,
                        alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                        {item.profiles?.avatar_url ? (
                            <Image source={{ uri: item.profiles.avatar_url }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Text style={{ fontWeight: 'bold' }}>{item.user_email?.charAt(0).toUpperCase()}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                            {item.profiles?.nickname || item.user_email?.split('@')[0]}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{new Date(item.created_at).toDateString()}</Text>
                    </View>
                </View>
                {/* Delete Post Button (Only for author) */}
                {currentUser?.id === item.user_id && (
                    <TouchableOpacity onPress={() => onDelete(item)}>
                        <Text style={{ fontSize: 20 }}>🗑️</Text>
                    </TouchableOpacity>
                )}
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
                    onPress={() => onLike(item, isLiked)}
                >
                    <Text style={{ fontSize: 28, marginRight: 8 }}>{isLiked ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>

                {/* Comment Button */}
                <TouchableOpacity onPress={() => onOpenComments(item.id)}>
                    <Text style={{ fontSize: 28 }}>💬</Text>
                </TouchableOpacity>
            </View>

            <Text style={{ fontWeight: '900', fontSize: 16, marginBottom: 5 }}>{item.likes_count} likes</Text>

            {/* Caption */}
            {item.caption && (
                <Text style={{ fontSize: 16, lineHeight: 22 }}>
                    <Text style={{ fontWeight: 'bold' }}>
                        {item.profiles?.nickname || item.user_email?.split('@')[0]}
                    </Text> {item.caption}
                </Text>
            )}

            <TouchableOpacity onPress={() => onOpenComments(item.id)}>
                <Text style={{ color: '#666', marginTop: 5 }}>View all comments...</Text>
            </TouchableOpacity>
        </View>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.item === nextProps.item &&
        prevProps.isLiked === nextProps.isLiked &&
        prevProps.currentUser?.id === nextProps.currentUser?.id
    );
});

export default PostItem;
