import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.dark.textMuted}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.dark.textMuted,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: COLORS.dark.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    paddingHorizontal: SPACING.md,
    height: 56,
    justifyContent: 'center',
  },
  input: {
    color: COLORS.dark.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.accent,
  },
  errorText: {
    color: COLORS.accent,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
