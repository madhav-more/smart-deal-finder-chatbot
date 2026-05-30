import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

const GradientBackground = ({ children, style }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradients.surface}
        style={[StyleSheet.absoluteFill, style]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;
