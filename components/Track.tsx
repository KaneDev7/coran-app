import { StyleSheet, View, Text, type ViewStyle, type DimensionValue } from 'react-native'
import { usePlayer } from '@/context/PlayerContext'
import { primary, secondary } from '../style/variables'
import { formatTime } from "../helpers"

export default function Track() {

  const { duration, timeUpdate } = usePlayer()
  // Progression en pourcentage : indépendante de la largeur réelle du conteneur.
  const percent = duration > 0 ? Math.min((timeUpdate / duration) * 100, 100) : 0

  const progressStyle: ViewStyle = {
    width: `${percent}%` as DimensionValue,
    height: 6,
    backgroundColor: primary,
    borderRadius: 50,
    position: 'absolute',
    left: 0,
  }

  return (
    <View style={style.track} >
      <View style={style.progressBar} >
        <View style={progressStyle} >
          <View style={style.progressDot}></View>
        </View>
      </View>
      <View style={style.trackTime}>
        <Text> {formatTime(timeUpdate)} </Text>
        <Text> {formatTime(duration)} </Text>
      </View>
    </View>
  )
}


const style = StyleSheet.create({
  track: {
    alignSelf: 'stretch',
    marginTop: 14
  },
  progressBar: {
    alignSelf: 'stretch',
    height: 6,
    backgroundColor: '#e6ddd3',
    position: 'relative',
    borderRadius: 50,

  },
  progress: {

  },
  progressDot: {
    width: 12,
    height: 12,
    backgroundColor: secondary,
    borderRadius: 100,
    position: 'absolute',
    zIndex: 2,
    top: -3,
    right: -6
  },
  trackTime: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 5
  }


})
