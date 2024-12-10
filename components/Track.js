import React, { useContext } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { windowWidth } from '../style'
import { GlobalContext } from '../app/(tabs)/_layout'
import { primary, secondary } from '../style/variables'
import {formatTime} from "../helpers"

export default function Track() {

  const {duration,timeUpdate} = useContext(GlobalContext)
  let width = ( timeUpdate / duration)  * windowWidth

  const progressStyle = {
    width:  width <= windowWidth ? width  : 0 ,
    height: 5,
    backgroundColor: secondary,
    position: 'absolute',
    left: '0',
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
        width: windowWidth,
        marginTop : 4
    },
    progressBar: {
      width: windowWidth,
      height: 5,
      backgroundColor: '#e3eef6',
      position: 'relative',
    },
    progress: {
     
    },
    progressDot:{
      // width: 10,
      // height: 10,
      backgroundColor: secondary,
      borderRadius: 100,
      position: 'absolute',
      zIndex: 2,
      top: -2,
      right : -5
    },
    trackTime: {
      display: 'flex',
      justifyContent :'space-between',
      flexDirection: 'row',
      marginTop: 5
    }


})
