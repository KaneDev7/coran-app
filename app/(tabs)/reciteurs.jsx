import { View, FlatList, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { primary, secondary, secondary3 } from '@/style/variables';
import { reciteurs } from "../../constants/reciteurs";
import { useReciter } from '@/context/ReciterContext';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { useOffline } from '@/context/OfflineContext';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ReciterItem = ({ item, index }) => {
  const { reciter, onSelectReciter } = useReciter();
  const { isPlaying, isLoading, initParams } = usePlayer();
  const { setCurrentSlide, selectSartVerset, currentIndex } = useLibrary();
  const { isOfflineMode } = useOffline();

  const isActive = reciter === item.title;
  const iconName = isActive ? 'checkcircle' : 'checkcircleo';
  // En mode hors ligne, le changement de réciteur est verrouillé.
  const isDisabled = (isLoading && isPlaying) || isActive || isOfflineMode;

  const handleSelectReciter = async () => {
    onSelectReciter(item.title);
    await initParams();
    setCurrentSlide(selectSartVerset);
    // Choisir un réciteur amène directement à la page d'écoute.
    router.push({ pathname: `/player/${currentIndex}` });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled
      ]}
      onPress={handleSelectReciter}
      disabled={isDisabled}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.itemGradient}
      >
        <View style={styles.leftContent}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={item.url}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subtitle}>
              <MaterialCommunityIcons name="microphone" size={14} color={secondary} />
              {' '}Récitateur professionnel
            </Text>
          </View>
        </View>

        <AntDesign 
            name={iconName} 
            size={20} 
            color={isActive ? primary : secondary} 
          />
      </LinearGradient>
    </Pressable>
  );
};

export default function Reciteurs() {
  const { isOfflineMode } = useOffline();

  return (
    <View style={styles.container}>
      {/* Indication claire : sélection verrouillée en mode hors ligne */}
      {isOfflineMode && (
        <View style={styles.offlineNotice}>
          <MaterialCommunityIcons name="cloud-off-outline" size={18} color="#fff" />
          <Text style={styles.offlineNoticeText}>
            Mode hors ligne actif : le changement de réciteur est verrouillé.
            Quittez le mode hors ligne depuis le lecteur pour le modifier.
          </Text>
        </View>
      )}
      <FlatList
        data={reciteurs}
        renderItem={({ item, index }) => <ReciterItem index={index} item={item} />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: secondary3,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e67e22',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  offlineNoticeText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: primary,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  activeStatus: {
    backgroundColor: `${primary}15`,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    color: primary,
    fontWeight: '500',
  },
});