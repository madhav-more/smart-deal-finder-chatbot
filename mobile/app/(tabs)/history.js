import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, MessageSquare } from 'lucide-react-native';
import { useChatStore } from '../../src/store/chatStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/theme';
import GradientBackground from '../../src/components/GradientBackground';

export default function HistoryScreen() {
  const { conversations, fetchConversations, isLoading } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/chat/${item._id}`)}
    >
      <View style={styles.cardIcon}>
        <MessageSquare size={20} color={COLORS.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.lastMessage || 'New Conversation'}
        </Text>
        <Text style={styles.cardSubtitle}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <ChevronRight size={20} color={COLORS.dark.textMuted} />
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSubtitle}>Your past deal searches</Text>
        </View>

        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchConversations}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No history found yet</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.dark.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dark.textMuted,
  },
  list: {
    padding: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark.surface,
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dark.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.dark.textMuted,
    ...TYPOGRAPHY.body,
  },
});
