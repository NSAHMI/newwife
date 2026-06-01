import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { countWords } from '../../utils/dateUtils';

interface EntryEditorProps {
  initialTitle?: string;
  initialBody?: string;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  placeholder?: string;
}

export function EntryEditor({
  initialTitle = '',
  initialBody = '',
  onTitleChange,
  onBodyChange,
  placeholder = 'Write your entry...',
}: EntryEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const wordCount = countWords(body);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    onTitleChange(text);
  };

  const handleBodyChange = (text: string) => {
    setBody(text);
    onBodyChange(text);
  };

  const insertMarkdown = (syntax: string) => {
    const newText = body + '\n' + syntax + ' ';
    setBody(newText);
    onBodyChange(newText);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="What's on your mind?"
        placeholderTextColor={COLORS.textMuted}
        multiline
        maxLength={80}
      />

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertMarkdown('**')}
        >
          <Text style={styles.toolbarText}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertMarkdown('*')}
        >
          <Text style={[styles.toolbarText, styles.italic]}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertMarkdown('- ')}
        >
          <Ionicons name="list" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertMarkdown('> ')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.bodyInput}
        value={body}
        onChangeText={handleBodyChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.wordCount}>{wordCount} words</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleInput: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    padding: 0,
    marginBottom: SPACING.lg,
    lineHeight: 34,
  },
  toolbar: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarText: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
  },
  italic: {
    fontStyle: 'italic',
  },
  bodyInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    padding: 0,
  },
  wordCount: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
