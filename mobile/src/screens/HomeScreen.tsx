import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@/navigation/types';

export const HomeScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#FF6B00', padding: 24, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{ color: '#FFFFFF', marginBottom: 16 }}>
        5LB Каталог скоро будет здесь
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Profile')}
        buttonColor="#D7263D"
        textColor="#FFFFFF"
      >
        Перейти в профиль
      </Button>
    </View>
  );
};
