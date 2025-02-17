import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { primary, secondary, secondary3 } from '@/style/variables';
import { GlobalContext } from './_layout';
import { router } from 'expo-router';
import { sourates } from '../../constants/sorats.list';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import { LinearGradient } from 'expo-linear-gradient';
import { EmptyList } from '../../components/EmptyList';
import * as Progress from 'react-native-progress'; // Pour le loader circulaire

const { width } = Dimensions.get('window');

const Item = ({ item, index }) => {
  const {
    isLoading,
    isPlaying,
    onDeleteLesson,
    downloadProgressId,
    loadSelectLesson,
  } = useContext(GlobalContext);

  const [dialogVisible, setDialogVisible] = useState(false);

  const handleSelectLesson = async () => {
    router.push({ pathname: `player/l-${item.index}` });
    loadSelectLesson(item);
  };

  const isPending = (isLoading && isPlaying )|| (downloadProgressId === item.id) 
  return (
    <Pressable
      style={({ pressed }) => [
        {pointerEvents :   isPending ? "none" : "auto" },
        styles.cardContainer,
        pressed && styles.pressed,
        isPending && styles.disabled,
    
      ]}
      onPress={handleSelectLesson}
      disabled={isLoading && isPlaying}
    >
      <LinearGradient colors={['#ffffff', '#f8f9fa']} style={styles.card}>
        <View style={styles.leftContent}>
          <View style={styles.courseNumber}>
            <Text style={styles.courseNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.lessonTitle}>
              <FontAwesome5 name='book-open' size={16} color={primary} /> Cours{' '}
              {index + 1}
            </Text>
            <View style={styles.suratInfo}>
              <Ionicons name='bookmark' size={16} color={secondary} />
              <Text style={styles.suratText}>
                {sourates[parseFloat(item.index)]?.nom}
              </Text>
            </View>
            <View style={styles.versetRange}>
              <MaterialCommunityIcons
                name='format-quote-open'
                size={16}
                color={secondary}
              />
              <Text style={styles.versetText}>
                Versets {item.selectSartVerset} - {item.selectEndVerset}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={() => setDialogVisible(true)}
          hitSlop={10}
        >
          {/* Afficher le loader circulaire ou l'icône de suppression */}
          {downloadProgressId === item.id ? (
            <View style={styles.loaderContainer}>
              <Progress.Circle
                size={24}
                indeterminate={true} // Mode indéterminé (animation infinie)
                color={primary}
                borderWidth={2}
              />
              <MaterialCommunityIcons
                name='download'
                size={16}
                color={primary}
                style={styles.downloadIcon}
              />
            </View>
          ) : (
            <MaterialCommunityIcons
              name='delete-outline'
              size={24}
              color='#dc3545'
            />
          )}
        </Pressable>

        <ConfirmDialog
          title='Confirmation de suppression'
          message='Êtes-vous sûr de vouloir supprimer ce cours ?'
          visible={dialogVisible}
          onTouchOutside={() => setDialogVisible(false)}
          positiveButton={{
            title: 'Supprimer',
            titleStyle: { color: primary },
            onPress: () => {
              onDeleteLesson(item.id);
              setDialogVisible(false);
            },
          }}
          negativeButton={{
            title: 'Annuler',
            titleStyle: { color: primary },
            onPress: () => setDialogVisible(false),
          }}
        />
      </LinearGradient>
    </Pressable>
  );
};

export default function Lessons() {
  const { lessonList } = useContext(GlobalContext);

  if (!lessonList.length) {
    return <EmptyList title={'Cours'} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lessonList}
        renderItem={({ item, index }) => <Item index={index} item={item} />}
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
  cardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
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
  courseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  courseNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  courseInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primary,
    marginBottom: 4,
  },
  suratInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suratText: {
    fontSize: 14,
    color: secondary,
    marginLeft: 6,
  },
  versetRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versetText: {
    fontSize: 14,
    color: secondary,
    marginLeft: 6,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  loaderContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIcon: {
    position: 'absolute', // Positionner l'icône au centre du loader
  },
});