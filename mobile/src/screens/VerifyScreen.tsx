import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { verifySmsCode } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

import type { RootStackParamList } from '@/navigation/types';

export const VerifyScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Verify'>) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const phone = useAuthStore((state) => state.phone);
  const setToken = useAuthStore((state) => state.setToken);

  const handleVerify = async () => {
    if (!phone) {
      navigation.replace('Login');
      return;
    }

    setIsLoading(true);
    try {
      const { token } = await verifySmsCode(phone, code);
      setToken(token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
          Подтвердите код
        </Text>
        <TextInput
          label="SMS код"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          style={{ marginBottom: 16 }}
        />
        <Button
          mode="contained"
          onPress={handleVerify}
          loading={isLoading}
          buttonColor="#D7263D"
          textColor="#FFFFFF"
        >
          Подтвердить
        </Button>
      </View>
    </View>
  );
};
