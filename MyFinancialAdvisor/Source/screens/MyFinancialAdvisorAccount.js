import React from 'react'
//import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
//import Button from '../components/Button';

export default function MyFinancialAdvisorAccount({ navigation }) {
  return (
    <View style={styles.container}>
    <Image source={require('../assets/star.png')} style={[styles.star]} />
    <Image source={require('../assets/star.png')} style={[styles.stars]} />
    {/* <Logo style={styles.logo} /> */}
    <Header style={styles.header}>My Financial Advisor</Header>
    {/* Create Account Button */}
    <Button
    style={[styles.button, styles.primaryButton]}
    mode="contained"
    onPress={() => navigation.navigate('MFACreateAccount')}
    >
      <Text>Create an Account                  </Text>
      <Text style={styles.arrow}>→</Text>
    </Button>

    {/* I Have an Account Button */}
    <Button
    style={[styles.button, styles.secondaryButton]}
    mode="contained"
    onPress={() => navigation.navigate('MFALoginScreen')}
    >
      <Text>I have an Account                  </Text>
      <Text style={styles.arrow}>→</Text>
    </Button>

    {/* Sign in with Google */}
    <Button
    style={[styles.button, styles.googleButton]} 
    onPress={() => console.log('Sign in with Google')}
    >
      <Image source={require('../assets/google.png')} style={styles.googleIcon} />
      <Text style={styles.googleText}>   Sign In with Google</Text>
    </Button>
    

    
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
    marginBottom: 65,
    marginTop: -40,
    textAlign:'center',
  },
  button: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 35,
  },
  primaryButton: {
    backgroundColor: '#7A5BD0', // purple color
    boxShadow: '4px 6px 8px rgba(199, 193, 239, 0.5)',
  },
  secondaryButton: {
    backgroundColor: '#C7C1EF', // Light background
    borderWidth: 1,
    borderColor: '#C7C1EF',
    boxShadow: '4px 6px 8px rgba(199, 193, 239, 0.5)',
  },
  arrow: {
    color: '#FFFFFF', // White arrow
    fontSize: 24,
    marginLeft: 8,
  },
  googleButton: {
    backgroundColor: '#FFFF', // Light background
    borderWidth: 1,
    justifyContent: 'center',
    boxShadow: '2px 4px 6px rgba(158, 158, 160, 0.5)',
  },
  googleIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginTop: -200,
  },
  googleText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
});