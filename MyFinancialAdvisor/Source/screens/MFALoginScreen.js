import React, { useState,useEffect } from 'react';
import Header from '../components/Header'
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from '@react-native-async-storage/async-storage';
//import MFAUserDashboard from './MFAUserDashboard';
import getLocalIP from '../../config';

let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/login`; // Set the global variable
  //console.log("API URL Set:", API_URL);
};

// Call the function once to set the API URL
setupAPI();

export default function MFALoginScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading,setLoading] = useState(false);
    const showToast = (message, type = 'error') => {
      Toast.show({
        type, // 'success' or 'error'
        text2: message,
        position: 'top',
      });
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: {
          username: "",
          password: "",
        },
      }); // Initialize useForm

      

  //const [response, setResponse] = useState(null);
  
  const handleSubmitting = async (reqdata) => {
    try
    {
      JSON.stringify(reqdata);
    }
    catch(e)
    {
      console.log("test1234"+e);
    }
    setLoading(true);
    //console.log(reqdata);

    try {
        //console.log(API_URL);
        const response = await fetch( API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqdata),
         });
        const data = await response.json();
        //console.log(data);
        
        // Check if the response was successful (status 200-299)
        if (response.ok && data.message === "Login successful") {
          const { username, fullName, email, phone, profileImage } = data.user; // Extract all user details

          // Store user session in AsyncStorage
          await AsyncStorage.setItem(
            "userSession",
            JSON.stringify({ username, fullName, email, phone, profileImage })
          );
          // Navigate to dashboard with user data
          //navigation.replace('MFAUserDashboard', { username, fullName, email, phone });
          navigation.replace('MFAUserDashboard');

      } else {
          // Handle error messages from API
          Alert.alert("Error", data.error || "Email or Password do not match.");
      }
  }
    catch (error) {
        showToast(error.message || "Network error");
        //console.error('Error:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView>
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

    {/* Star Image */}
    <Image source={require('../assets/star.png')} style={[styles.star]} />
    <Image source={require('../assets/star.png')} style={[styles.stars]} />

    {/* Header */}
    <Header style={styles.header}>Sign In</Header>

    {/* Username Input */}
    <View style={styles.inputConatiner}>
      <Controller
        control={control}
        rules={{
          required: "Username is required", // Ensures the username is not empty
          minLength: {
            value: 3, // Ensures the username is at least 3 characters long
            message: "Username must be at least 3 characters", // Error message if the username is too short
          },
          maxLength: {
            value: 15, // Ensures the username does not exceed 15 characters
            message: "Username cannot exceed 15 characters", // Error message if the username is too long
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/, // Validates that the username contains only letters, numbers, and underscores
            message: "Username can only contain letters, numbers, and underscores",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#C4C4C4"
            onBlur={onBlur} // Trigger validation on blur
            onChangeText={onChange} // Update value in form state
            value={value}
          />
        )}
        name="username" // Field name for the username
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username.message}</Text> // Show error message if validation fails
      )}
    </View>

    {/* Password Input */}
    <View style={styles.passwordContainer}>
      <Controller
        control={control}
        rules={{
          required: "Password is required", // Password is a required field
          minLength: {
            value: 6, // Minimum length for password
            message: "Password must be at least 6 characters long", // Error message if password is too short
          },
          pattern: {
            value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~`-]).{6,}$/, // Regex for password complexity
            message: "Password must contain at least one uppercase letter, one number, and one special character", // Error message for invalid password format
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputs}
            placeholder="Password"
            placeholderTextColor="#C4C4C4"
            secureTextEntry={!passwordVisible} // Toggle password visibility
            onBlur={onBlur} // Trigger validation when the input loses focus
            onChangeText={onChange} // Update value in form state
            value={value}
          />
        )}
        name="password" // Field name for password
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text> // Show error message if validation fails
      )}
      
      {/* Eye Icon for Password Visibility Toggle */}
      <TouchableOpacity
        onPress={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
        style={styles.eyeIconContainer}
      >
        <Image
          source={
            passwordVisible
              ? require('../assets/openEye.png') // "eye open" image for visible password
              : require('../assets/closeEye.png') // "eye closed" image for hidden password
          }
          style={styles.eyeIcon}
        />
      </TouchableOpacity>
    </View>

    {/* Create Account Button */}
  <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(handleSubmitting)} // Handle form submission
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sign In Account..." : "Sign In"}
        </Text>
      </TouchableOpacity>
    

    {/* Forgot Password */}
    <Text style={styles.forgotPasswordText}>Did you forget your password?</Text>
      <TouchableOpacity onPress={() => navigation.navigate('MFAUserDashboard')}>
        <Text style={styles.resetPasswordText}>Tap here for reset</Text>
      </TouchableOpacity>

    
  </View>
  </ScrollView>
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
  inputConatiner:
  {
    width: '100%',
    marginLeft: '10%',
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
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 65,
    marginTop: 150,
    //textAlign:'center',
  },
  button: {
    justifyContent: 'center',
    borderRadius: 30,
    paddingHorizontal: 80,
    width: '60%',
    height: '9%',
    marginBottom: 35,
    backgroundColor: '#7A5BD0',
    boxShadow: '4px 6px 8px rgba(140, 124, 243, 0.5)',
  },
  buttonText: {
    color: '#FFFFFF', // Ensure the text color is set
    fontSize: 16,
    fontWeight: 'bold',
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
    //flexDirection: 'row',
    //alignItems: 'center',
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
  errorText: {
    color: 'red',
    zIndex: 1001,
    marginTop: -40,
    marginBottom: 20,
  },
});