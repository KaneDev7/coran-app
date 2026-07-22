import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import { MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { secondary } from '@/style/variables';

import { ReciterProvider } from '@/context/ReciterContext';
import { LibraryProvider } from '@/context/LibraryContext';
import { OfflineProvider } from '@/context/OfflineContext';
import { PlayerProvider } from '@/context/PlayerContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function TabsLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Ordre d'imbrication imposé par les dépendances entre domaines :
  // le moteur audio (Player) consomme Reciter, Library et Offline.
  return (
    <ReciterProvider>
      <LibraryProvider>
        <OfflineProvider>
          <PlayerProvider>
            <Tabs screenOptions={{ tabBarActiveTintColor: secondary }}>
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Sourates',
                  tabBarIcon: ({ color, focused }) => <Entypo name="list" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
                }}
              />

              <Tabs.Screen
                name="lessons"
                options={{
                  headerShadowVisible: false,
                  title: "hors ligne",
                  tabBarIcon: ({ color, focused }) => <Feather name="wifi-off" style={{ opacity: focused ? 1 : .4 }} size={20} color={secondary} />,
                }}
              />
              <Tabs.Screen
                name="player/[index]"
                options={{
                  headerShadowVisible: false,
                  title: 'Ecouter',
                  headerShown: false,
                  tabBarIcon: ({ color, focused }) => <AntDesign name="play-circle" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />
                }}
              />
              <Tabs.Screen
                name="reciteurs"
                options={{
                  headerShadowVisible: false,
                  title: 'Réciteurs',
                  tabBarIcon: ({ color, focused }) => <FontAwesome5 name="headset" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
                }}
              />

              <Tabs.Screen
                name="settings"
                options={{
                  headerShadowVisible: false,
                  title: 'Paramètres',
                  tabBarIcon: ({ color, focused }) => <Feather name="settings" size={20} style={{ opacity: focused ? 1 : .4 }} color={secondary} />,
                }}
              />

            </Tabs>
            <StatusBar style="auto" />
          </PlayerProvider>
        </OfflineProvider>
      </LibraryProvider>
    </ReciterProvider>
  );
}
