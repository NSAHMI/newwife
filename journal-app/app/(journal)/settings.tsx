/**
 * Settings Screen
 * App configuration and data management
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { useJournal } from '../../context/JournalContext';
import { useSettings } from '../../hooks/useSettings';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { formatDateTime } from '../../utils/dateUtils';

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
  loading?: boolean;
};

function SettingsItem({ icon, title, subtitle, value, onPress, danger, loading }: SettingsItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsItem, pressed && onPress && styles.itemPressed]}
      onPress={onPress}
      disabled={!onPress || loading}
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
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.accent} />
      ) : value ? (
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
  const { entries, removeEntry } = useJournal();
  const { settings, setReLockTimeout, getReLockTimeoutLabel, isLoading: settingsLoading } = useSettings();

  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  /**
   * Calculate estimated storage size
   */
  const storageUsed = useMemo(() => {
    let totalSize = 0;
    entries.forEach((entry) => {
      // Estimate size based on content
      totalSize += (entry.title?.length || 0) * 2; // UTF-16
      totalSize += (entry.body?.length || 0) * 2;
      totalSize += entry.tags ? entry.tags.join(',').length * 2 : 0;
      // Add approximate metadata size
      totalSize += 200;
    });

    if (totalSize < 1024) {
      return `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
    }
  }, [entries]);

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
      [
        ...CONFIG.RE_LOCK_OPTIONS.map((option) => ({
          text: option.label + (option.value === settings.reLockTimeout ? ' ✓' : ''),
          onPress: async () => {
            try {
              await setReLockTimeout(option.value);
            } catch (error) {
              Alert.alert('Error', 'Failed to update setting. Please try again.');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  /**
   * Generate export content
   */
  const generateExportContent = (): string => {
    let content = '=== JOURNAL EXPORT ===\n';
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Entries: ${entries.length}\n`;
    content += '='.repeat(50) + '\n\n';

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
      const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
      return dateB.getTime() - dateA.getTime();
    });

    sortedEntries.forEach((entry, index) => {
      content += `--- Entry ${index + 1} ---\n`;
      content += `Date: ${formatDateTime(entry.createdAt)}\n`;
      content += `Mood: ${entry.mood}\n`;
      content += `Title: ${entry.title}\n`;
      if (entry.tags && entry.tags.length > 0) {
        content += `Tags: ${entry.tags.map((t) => '#' + t).join(', ')}\n`;
      }
      content += `\n${entry.body}\n`;
      content += '\n' + '-'.repeat(50) + '\n\n';
    });

    return content;
  };

  /**
   * Handle export journal
   */
  const handleExportJournal = async () => {
    if (entries.length === 0) {
      Alert.alert('No Entries', 'You don\'t have any journal entries to export yet.');
      return;
    }

    Alert.alert(
      'Export Journal',
      `This will create a text file containing all ${entries.length} entries.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setIsExporting(true);
            try {
              const content = generateExportContent();
              const fileName = `journal_export_${new Date().toISOString().split('T')[0]}.txt`;
              const cacheDir = Paths.cache;
              const file = new File(cacheDir, fileName);
              await file.write(content);
              const filePath = file.uri;

              // Check if sharing is available
              const isSharingAvailable = await Sharing.isAvailableAsync();

              if (isSharingAvailable) {
                await Sharing.shareAsync(filePath, {
                  mimeType: 'text/plain',
                  dialogTitle: 'Export Journal',
                });
              } else {
                // Fallback to system share
                await Share.share({
                  message: content,
                  title: 'Journal Export',
                });
              }
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('Export Failed', 'Failed to export journal. Please try again.');
            } finally {
              setIsExporting(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle clear all data
   */
  const handleClearData = () => {
    if (entries.length === 0) {
      Alert.alert('No Data', 'There is no data to clear.');
      return;
    }

    Alert.alert(
      'Clear All Data',
      `This will permanently delete all ${entries.length} journal entries. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Are you absolutely sure?',
              'All your journal entries will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    setIsClearing(true);
                    try {
                      // Delete all entries
                      const deletePromises = entries.map((entry) =>
                        removeEntry(entry.id)
                      );
                      await Promise.all(deletePromises);
                      Alert.alert('Data Cleared', 'All journal entries have been deleted.');
                    } catch (error) {
                      console.error('Clear data error:', error);
                      Alert.alert('Error', 'Failed to clear all data. Some entries may remain.');
                    } finally {
                      setIsClearing(false);
                    }
                  },
                },
              ]
            );
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
            value={settingsLoading ? '...' : getReLockTimeoutLabel()}
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
            icon="document-text-outline"
            title="Journal Entries"
            subtitle="Total number of entries"
            value={`${entries.length}`}
          />
          <SettingsItem
            icon="cloud-outline"
            title="Storage Used"
            subtitle="Estimated based on entries"
            value={storageUsed}
          />
          <SettingsItem
            icon="download-outline"
            title="Export Journal"
            subtitle="Download all entries as text"
            onPress={handleExportJournal}
            loading={isExporting}
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
            loading={isClearing}
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Journal App</Text>
          <Text style={styles.footerText}>Your private thoughts, secured</Text>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isClearing}
        message="Clearing all data..."
      />
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
