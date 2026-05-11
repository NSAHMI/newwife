/**
 * Settings Screen
 * App configuration and data management
 */

import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';

/**
 * Settings item component
 */
type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
};

function SettingsItem({ icon, title, subtitle, value, onPress, danger }: SettingsItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsItem, pressed && onPress && styles.itemPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? COLORS.error : COLORS.accent}
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, danger && styles.itemTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {value ? (
        <Text style={styles.itemValue}>{value}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      ) : null}
    </Pressable>
  );
}

/**
 * Settings section component
 */
type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

/**
 * Settings screen component
 */
export default function SettingsScreen() {
  const { lock } = useAuth();

  /**
   * Handle lock now action
   */
  const handleLockNow = () => {
    Alert.alert('Lock App', 'Are you sure you want to lock the app?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Lock',
        onPress: () => {
          lock();
          router.replace('/(auth)/lock');
        },
      },
    ]);
  };

  /**
   * Handle re-lock timeout selection
   */
  const handleReLockTimeout = () => {
    Alert.alert(
      'Re-lock After',
      'Choose how long the app stays unlocked in the background',
      CONFIG.RE_LOCK_OPTIONS.map((option) => ({
        text: option.label,
        onPress: () => {
          // TODO: Save to SecureStore in Phase 8
          Alert.alert('Setting Updated', `App will re-lock after ${option.label}`);
        },
      }))
    );
  };

  /**
   * Handle export journal
   */
  const handleExportJournal = () => {
    Alert.alert('Export Journal', 'This will create a text file of all your entries.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: () => {
          // TODO: Implement export in Phase 8
          Alert.alert('Coming Soon', 'Export feature will be available in a future update.');
        },
      },
    ]);
  };

  /**
   * Handle clear all data
   */
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your journal entries and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear data in Phase 8
            Alert.alert('Coming Soon', 'This feature will be available in a future update.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <SettingsSection title="Security">
          <SettingsItem
            icon="time-outline"
            title="Re-lock after"
            subtitle="Lock the app when in background"
            value="30 seconds"
            onPress={handleReLockTimeout}
          />
          <SettingsItem
            icon="lock-closed-outline"
            title="Lock Now"
            subtitle="Immediately lock the app"
            onPress={handleLockNow}
          />
        </SettingsSection>

        {/* Storage Section */}
        <SettingsSection title="Storage">
          <SettingsItem
            icon="cloud-outline"
            title="Storage Used"
            subtitle="Estimated based on entries"
            value="0 KB"
          />
          <SettingsItem
            icon="download-outline"
            title="Export Journal"
            subtitle="Download all entries as text"
            onPress={handleExportJournal}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsItem
            icon="information-circle-outline"
            title="Version"
            value="1.0.0"
          />
          <SettingsItem
            icon="code-outline"
            title="Build"
            value="1"
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Danger Zone">
          <SettingsItem
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Delete all entries and reset app"
            onPress={handleClearData}
            danger
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Journal App</Text>
          <Text style={styles.footerText}>Your private thoughts, secured</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxxxl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemPressed: {
    backgroundColor: COLORS.background,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainerDanger: {
    backgroundColor: `${COLORS.error}15`,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  itemTitleDanger: {
    color: COLORS.error,
  },
  itemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});
