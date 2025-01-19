import React from 'react'
//import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
//import Paragraph from '../components/Paragraph'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
//import Button from '../components/Button';

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/star.png')} style={[styles.star]} />
    <Logo style={styles.logo} />
    <Image source={require('../assets/star.png')} style={[styles.stars]} />
    <Header style={styles.header}>Easy way to manage your Expenses</Header>
    <Button
    style={styles.button}
    mode="contained"
    onPress={() => navigation.navigate('SecondStartScreen')}
    >
      <Text>Get Started</Text>
      <Text style={styles.arrow}>→</Text>
    </Button>
    

    {/* Dashed Line (Indicator Dots) */}
    <View style={styles.dashedLine}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
    </View>
  </View>
  )
}
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width:300,
    height:300,
  },
  header: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft:-64,
  },
  star: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  stars: {
    position: 'absolute',
    bottom: 300,
    right: 20,
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4F37'
  },
  arrow: {
    color: '#FFFFFF', // White arrow
    fontSize: 24,
    marginLeft: 8,
  },
  dashedLine: {
    flexDirection: 'row',
    marginTop: 4, // Space between button and dashed line
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4, // Circular dots
    backgroundColor: '#B0B0B0', // Inactive dot color
    marginHorizontal: 2,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#4C4C4C', // Active dot color
  },
});