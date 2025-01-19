import React from 'react'
import { Image, StyleSheet } from 'react-native'

export default function Logo({style}) {
  return <Image source={require('../assets/logo.png')} style={[styles.image,style]} />
}

const styles = StyleSheet.create({
  image: {
    width: 110,
    height: 110,
    marginBottom: 8,
  },
})