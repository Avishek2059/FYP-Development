import React, { useState } from 'react'
//import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text } from 'react-native';
//import Button from '../components/Button';

export default function MFALoginScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View style={styles.container}>

    {/* Back Button */}
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require('../assets/arrow_back.png')} // Replace with your back arrow image
              style={styles.backButtonImage}
            />
          </TouchableOpacity>
    <Image source={require('../assets/star.png')} style={[styles.star]} />
    <Image source={require('../assets/star.png')} style={[styles.stars]} />
    {/* <Logo style={styles.logo} /> */}
    <Header style={styles.header}>Sign In</Header>
    {/* Create Account Button */}

    {/* Username Input */}
    <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#C4C4C4"
      />

    {/* Password Input */}
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.inputs}
        placeholder="Password"
        placeholderTextColor="#C4C4C4"
        secureTextEntry={!passwordVisible}
      />
      <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeIconContainer}
        >
          <Image
            source={
              passwordVisible
                ? require('../assets/openEye.png') // Replace with your "eye open" icon
                : require('../assets/closeEye.png') // Replace with your "eye closed" icon
            }
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>

    <Button
    style={styles.button}
    mode="contained"
    onPress={() => navigation.navigate('MyFinancialAdvisorAccount')}
    > Sign In
    </Button>
    {/* Forgot Password */}
    <Text style={styles.forgotPasswordText}>Did you forget your password?</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.resetPasswordText}>Tap here for reset</Text>
      </TouchableOpacity>

    
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 5,
    zIndex: 10, // Ensure it appears above other elements
  },
  backButtonImage: {
    width: 70,
    height: 24,
    resizeMode: 'contain',
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
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: '60%',
    marginBottom: 35,
    backgroundColor: '#7A5BD0',
    boxShadow: '4px 6px 8px rgba(140, 124, 243, 0.5)',
  },
  input: {
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: '#7A5BD0',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 40,
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  inputs: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#7A5BD0',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 40,
    color: '#333333',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 20,
    top: 0,
  },
  eyeIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  forgotPasswordText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B6B6B',
  },
  resetPasswordText: {
    fontSize: 14,
    color: '#7D4EFF', // Purple color for link
    textDecorationLine: 'underline',
    marginTop: 5,
  },
});