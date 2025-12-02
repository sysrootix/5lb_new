import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { requestSmsCode } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

import type { RootStackParamList } from '@/navigation/types';

export const LoginScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setPhoneStore = useAuthStore((state) => state.setPhone);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      await requestSmsCode(phone);
      setPhoneStore(phone);
      navigation.navigate('Verify');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#FF6B00' }}>
      <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24 }}>
        <Text variant="headlineMedium" style={{ color: '#D7263D', marginBottom: 12 }}>
          Вход по телефону
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
          Введите номер телефона, чтобы получить SMS код.
        </Text>
        <TextInput
          label="Телефон"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={{ marginBottom: 16 }}
        />
        <Button
          mode="contained"
          onPress={handleSendCode}
          loading={isLoading}
          buttonColor="#D7263D"
          textColor="#FFFFFF"
        >
          Получить код
        </Button>
      </View>
    </View>
  );
};
