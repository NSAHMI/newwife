import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../context/AuthContext';
import { useJournal } from '../../context/JournalContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONFIG, STORAGE_KEYS } from '../../constants/config';
import { formatDate } from '../../utils/dateUtils';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lock, userId } = useAuth();
  const { entries, removeEntry } = useJournal();
  const [reLockTimeout, setReLockTimeout] = useState(CONFIG.RE_LOCK_TIMEOUT_MS);
  const [showClearAll, setShowClearAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEYS.RE_LOCK_TIMEOUT);
    if (stored) setReLockTimeout(parseInt(stored, 10));
  };

  const handleTimeoutChange = async (value: number) => {
    setReLockTimeout(value);
    await SecureStore.setItemAsync(STORAGE_KEYS.RE_LOCK_TIMEOUT, value.toString());
  };

  const handleLockNow = () => {
    lock();
    router.replace('/(auth)/lock');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const sortedEntries = [...entries].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });

      let content = 'MY JOURNAL\n';
      content += '===========\n\n';

      for (const entry of sortedEntries) {
        content += `${formatDate(entry.createdAt)}\n`;
        content += `Mood: ${entry.mood}\n`;
        content += `${entry.title}\n`;
        content += `${'─'.repeat(40)}\n`;
        content += `${entry.body}\n`;
        if (entry.tags.length > 0) {
          content += `Tags: ${entry.tags.join(', ')}\n`;
        }
        content += '\n';
      }

      const fileUri = `${FileSystem.documentDirectory}journal_export.txt`;
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export Journal Entries',
      });
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export journal entries.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = async () => {
    try {
      for (const entry of entries) {
        await removeEntry(entry.id);
      }
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.RE_LOCK_TIMEOUT);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.LAST_ACTIVE);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.DRAFT_ENTRY);
      setShowClearAll(false);
      lock();
      router.replace('/(auth)/lock');
    } catch (err) {
      Alert.alert('Error', 'Failed to clear all data.');
    }
  };

  const timeoutOptions = [
    { label: '15 seconds', value: 15000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ];

  const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed" size={20} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Re-lock after</Text>
            </View>
          </View>
          {timeoutOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                reLockTimeout === option.value && styles.optionSelected,
              ]}
              onPress={() => handleTimeoutChange(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  reLockTimeout === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {reLockTimeout === option.value && (
                <Ionicons name="checkmark" size={18} color={COLORS.accent} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.lockNowButton} onPress={handleLockNow}>
            <Ionicons name="lock-closed" size={18} color={COLORS.error} />
            <Text style={styles.lockNowText}>Lock Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="stats-chart" size={20} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Entries</Text>
            </View>
            <Text style={styles.rowValue}>{entries.length}</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="text" size={20} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Total Words</Text>
            </View>
            <Text style={styles.rowValue}>{totalWords.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Ionicons name="download" size={18} color={COLORS.accent} />
            <Text style={styles.exportText}>
              {isExporting ? 'Exporting...' : 'Export Journal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle" size={20} color={COLORS.textSecondary} />
              <Text style={styles.rowLabel}>Version</Text>
            </View>
            <Text style={styles.rowValue}>{CONFIG.APP_VERSION}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.dangerButton}
        onPress={() => setShowClearAll(true)}
      >
        <Ionicons name="trash" size={18} color={COLORS.error} />
        <Text style={styles.dangerText}>Clear All Data</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={showClearAll}
        title="Clear All Data"
        message="This will permanently delete all your entries and settings. This action cannot be undone."
        confirmLabel="Clear Everything"
        destructive
        onConfirm={handleClearAll}
        onCancel={() => setShowClearAll(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rowLabel: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  rowValue: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  optionSelected: {
    backgroundColor: COLORS.accent + '10',
  },
  optionText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.accent,
    fontWeight: FONTS.semibold,
  },
  lockNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  lockNowText: {
    fontSize: FONTS.md,
    color: COLORS.error,
    fontWeight: FONTS.semibold,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  exportText: {
    fontSize: FONTS.md,
    color: COLORS.accent,
    fontWeight: FONTS.semibold,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.error + '10',
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
  },
  dangerText: {
    fontSize: FONTS.md,
    color: COLORS.error,
    fontWeight: FONTS.semibold,
  },
});
