import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { fetchProfile } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

interface ProfileData {
  id: string;
  phone: string;
  displayName: string;
  bonus: number;
}

export const ProfileScreen = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }
      try {
        const data = await fetchProfile(token);
        setProfile(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [token]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FF6B00', padding: 24 }}>
      <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24 }}>
        <Text variant="headlineSmall" style={{ color: '#D7263D', marginBottom: 8 }}>
          Профиль
        </Text>
        <Text variant="titleMedium" style={{ marginBottom: 4 }}>
          {profile?.displayName ?? 'Загружаем...'}
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
          Телефон: {profile?.phone ?? '—'}
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 24 }}>
          Бонусы: {profile?.bonus ?? 0}
        </Text>
        <Button mode="outlined" onPress={logout} textColor="#D7263D">
          Выйти
        </Button>
      </View>
    </View>
  );
};
