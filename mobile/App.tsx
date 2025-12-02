import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { useMemo } from 'react';

import { LoginScreen } from '@/screens/LoginScreen';
import { VerifyScreen } from '@/screens/VerifyScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useAuthStore } from '@/store/authStore';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const initialRoute = useMemo(() => (isAuthenticated ? 'Home' : 'Login'), [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: 'Код из SMS' }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: '5LB Store' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}
