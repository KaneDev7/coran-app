import { usePlayer } from '@/context/PlayerContext';
import { router } from 'expo-router';
import { SurahCard } from './SurahCard';
import type { Sourate } from '@/types/models';

interface SourateItemProps {
  item: Sourate
  index: number
}

// Élément de la liste des sourates (révision libre) : réutilise la
// carte présentationnelle SurahCard et branche la navigation + l'état
// de lecture.
export const SourateItem = ({ item, index }: SourateItemProps) => {
  const { isLoading, isPlaying } = usePlayer();
  const locked = isLoading && isPlaying;

  return (
    <SurahCard
      item={item}
      disabled={locked}
      onPress={() => router.push({ pathname: '/player/[index]', params: { index } })}
    />
  );
};
