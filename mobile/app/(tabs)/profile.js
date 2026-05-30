import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, User, Settings, Bell, Shield, Info } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/theme';
import GradientBackground from '../../src/components/GradientBackground';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const MenuItem = ({ icon: Icon, title, onPress, color = COLORS.dark.text }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}10` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.menuTitle, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.menuList}>
              <MenuItem icon={User} title="Edit Profile" onPress={() => {}} />
              <MenuItem icon={Bell} title="Notifications" onPress={() => {}} />
              <MenuItem icon={Shield} title="Privacy & Security" onPress={() => {}} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuList}>
              <MenuItem icon={Info} title="Help Center" onPress={() => {}} />
              <MenuItem icon={Settings} title="Settings" onPress={() => {}} />
            </View>
          </View>

          <View style={[styles.section, { marginTop: SPACING.xl }]}>
            <MenuItem 
              icon={LogOut} 
              title="Logout" 
              onPress={handleLogout} 
              color={COLORS.accent} 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...TYPOGRAPHY.h1,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.dark.text,
  },
  userEmail: {
    ...TYPOGRAPHY.body,
    color: COLORS.dark.textMuted,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },
  menuList: {
    backgroundColor: COLORS.dark.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
});
