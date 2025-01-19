import React from 'react'
//import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
//import Button from '../components/Button';

export default function SecondStartScreen({ navigation }) {
  return (
    <View style={styles.container}>
    <Image source={require('../assets/star.png')} style={[styles.star]} />
    <Image source={require('../assets/secondstart.png')} style={[styles.logo]} />
    <Image source={require('../assets/star.png')} style={[styles.stars]} />
    {/* <Logo style={styles.logo} /> */}
    <Header style={styles.header}>Save your  Money &    Predict Expenses </Header>
    <Button
    style={styles.button}
    mode="contained"
    onPress={() => navigation.navigate('ThirdStartScreen')}
    >
      <Text>Next</Text>
      <Text style={styles.arrow}>→</Text>
    </Button>
    

    {/* Dashed Line (Indicator Dots) */}
    <View style={styles.dashedLine}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
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
    width:400,
    //height:400,
    resizeMode:'contain',
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
  header: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: -40,
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
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