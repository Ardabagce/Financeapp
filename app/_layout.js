import { Stack } from 'expo-router';
import { FinansProvider } from './context/FinansContext';
import { View } from 'react-native';
import TabBar from './components/TabBar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FinansProvider>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 200,
              contentStyle: {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="gelir" />
            <Stack.Screen name="gider" />
            <Stack.Screen 
              name="gelir-ekle" 
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Gelir Ekle',
              }}
            />
            <Stack.Screen 
              name="gider-ekle" 
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Gider Ekle',
              }}
            />
          </Stack>
          <TabBar />
        </View>
      </FinansProvider>
    </GestureHandlerRootView>
  );
} 