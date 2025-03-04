import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import FinansProvider from './context/FinansContext';
import { View } from 'react-native';
import { memo, useEffect } from 'react';
import TabBar from './components/TabBar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AyarlarProvider from './context/AyarlarContext';
import { BildirimProvider } from './context/BildirimContext';

// TabBar'ı memoize edelim
const MemoizedTabBar = memo(TabBar);

// Ana ekranlar için options
const mainScreenOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 200,
  contentStyle: {
    backgroundColor: '#f5f5f5',
  }
};

// Modal ekranlar için options
const modalScreenOptions = {
  headerShown: false,
  presentation: 'modal',
  animation: 'slide_from_bottom',
  contentStyle: {
    backgroundColor: '#000000',
  },
  animationDuration: 200,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  gestureResponseDistance: {
    vertical: 200
  },
  cardStyle: { 
    backgroundColor: '#000000',
    opacity: 1
  },
  cardOverlayEnabled: false,
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress
    }
  })
};

// Ana uygulama yapısı
export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AyarlarProvider>
        <BildirimProvider>
          <FinansProvider>
            <StatusBar style="auto" />
            <View style={{ flex: 1 }}>
              <Stack>
                <Stack.Screen 
                  name="index" 
                  options={mainScreenOptions}
                />
                <Stack.Screen 
                  name="gelir" 
                  options={mainScreenOptions}
                />
                <Stack.Screen 
                  name="gider" 
                  options={mainScreenOptions}
                />
                <Stack.Screen 
                  name="ayarlar" 
                  options={mainScreenOptions}
                />
                <Stack.Screen 
                  name="gelir-ekle"
                  options={modalScreenOptions}
                />
                <Stack.Screen 
                  name="gider-ekle"
                  options={modalScreenOptions}
                />
                <Stack.Screen 
                  name="seyahat-planla"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
              </Stack>
              <MemoizedTabBar />
            </View>
          </FinansProvider>
        </BildirimProvider>
      </AyarlarProvider>
    </GestureHandlerRootView>
  );
} 