import { View, FlatList, Text, StyleSheet, Image, Pressable } from 'react-native';
import { primary, secondary, secondary3 } from '@/style/variables';
import { reciteurs } from "../../constants/reciteurs";
import { useContext } from 'react';
import { GlobalContext } from './_layout';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ReciterItem = ({ item, index }) => {
  const {
    reciter,
    isPlaying,
    setCurrentSlide,
    selectSartVerset,
    initParams,
    onSelectReciter,
    isLoading,
  } = useContext(GlobalContext);

  const isActive = reciter === item.title;
  const iconName = isActive ? 'checkcircle' : 'checkcircleo';
  const isDisabled = (isLoading && isPlaying) || isActive;

  const handleSelectReciter = async () => {
    onSelectReciter(item.title);
    await initParams();
    setCurrentSlide(selectSartVerset);
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
  return (
    <View style={styles.container}>
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