import { ReactNode } from 'react';
import { View } from 'react-native';

interface BrandBackgroundProps {
  children: ReactNode;
}

export const BrandBackground = ({ children }: BrandBackgroundProps) => (
  <View style={{ flex: 1, backgroundColor: '#FF6B00', padding: 24 }}>{children}</View>
);
