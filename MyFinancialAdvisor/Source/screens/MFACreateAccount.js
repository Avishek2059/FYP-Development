import React, { useState } from 'react'
//import Logo from '../components/Logo'
import Header from '../components/Header'
//import Button from '../components/Button'
import { StyleSheet, TextInput, View, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import { useForm, Controller } from "react-hook-form";
import Toast from 'react-native-toast-message'; // Assuming you have Toast imported
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { useRouter } from 'next/router'; // If you're using Next.js for navigation
//import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://100.64.217.29:5005/register'; // Replace with your actual backend URL register

export default function MFACreateAccount({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading,setLoading] = useState(false);
  const showToast = (message) => {
    Toast.show({
      type: 'error',
      text2: message,
      position: 'top',
    });
  };

  //const router = useRouter();
  //const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    },
  }); // Initialize useForm


  // filepath: /d:/FYP Development/FYP Development/MyFinancialAdvisor/Source/screens/MFACreateAccount.js
    const handleCreatingAccount = async (reqdata) => {
      setLoading(true);
      console.log(reqdata);

      try {
          console.log(API_URL);
          const response = await fetch( API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(reqdata),
          });
          const data = await response.json();
          if (response.ok) {
              showToast('User registered successfully');
              navigation.replace('/login'); // Navigate to th
              // e login page
          } else {
              showToast(data.message || "An error occurred");
          }
      } catch (error) {
          showToast(error.message || "Network error");
          console.error('Error:', error);
      } finally {
          setLoading(false);
      }
    };

  //const { control, handleSubmit, formState: { errors } } = useForm(); 
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
    
    <Image source={require('../assets/star.png')} style={[styles.star]} />
    <Image source={require('../assets/star.png')} style={[styles.stars]} />
    {/* <Logo style={styles.logo} /> */}
    <Header style={styles.header}>Create Account</Header>
    {/* Create Account Button */}

    {/* Full Name Input */}
    {/* <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#C4C4C4"
      /> */}
      <View style={styles.inputConatiner}>
        <Controller
          control={control}
          rules={{
            required: "Full Name is required", // Validation rule for required field
            minLength: {
              value: 3,
              message: "Full Name must be at least 3 characters long", // Validation for minimum length
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#C4C4C4"
              onBlur={onBlur} // Handle onBlur for validation
              onChangeText={onChange} // Update form state on change
              value={value} // Bind the current value from React Hook Form
            />
          )}
          name="fullName" // Key to identify this field in the form
        />
        {errors.fullName && (
          <Text style={styles.errorText}>{errors.fullName.message}</Text>
        )}
    </View>
    
    {/* Email Input */}
    <View style={styles.inputConatiner}>
      <Controller
        control={control}
        rules={{
          required: "Email is required", // Validation for required field
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regex for email format
            message: "Enter a valid email address", // Validation for email pattern
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#C4C4C4"
            onBlur={onBlur} // Triggers validation on blur
            onChangeText={onChange} // Updates form state
            value={value} // Binds the value from the form
          />
        )}
        name="email" // Identifier for the input in the form state
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}
    </View>

    {/* Phone Input */}
    <View style={styles.inputConatiner}>
      <Controller
        control={control}
        rules={{
          required: "Phone number is required", // Required field
          pattern: {
            value: /^[0-9]{10}$/, // Regular expression for a valid 10-digit phone number
            message: "Enter a valid phone number", // Error message if the pattern doesn't match
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#C4C4C4"
            keyboardType="numeric" // Ensures only numeric input (digits) is allowed
            onBlur={onBlur} // Trigger validation when the input loses focus
            onChangeText={onChange} // Update the form state with the input value
            value={value} // Bind the value from the form state to the TextInput
          />
        )}
        name="phone" // The field name for the phone number
      />
      {errors.phone && (
        <Text style={styles.errorText}>{errors.phone.message}</Text> // Show error message if validation fails
      )}
    </View>

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

      

    {/* <Button
    title={loading ? "Creating Account..." : "Create Account"}
    style={styles.button}
    mode="contained"
    onPress={handleSubmit(handleCreatingAccount)} // Handle form submission
    disabled={loading}
    />  */}
    <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(handleCreatingAccount)} // Handle form submission
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>
    {/* </Button> */}

    
  </View>
  </ScrollView>
  )
}


// Styles
const styles = StyleSheet.create({
  container: {
    position: 'relative',
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
    top: 80,
    right: 20,
    width: 100,
    height: 100,
    resizeMode: 'contain',
    zIndex:1,
  },
  stars: {
    position: 'absolute',
    bottom: 220,
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
    textAlign:'center',
  },
  button: {
    justifyContent: 'center',
    borderRadius: 30,
    paddingHorizontal: 50,
    width: '60%',
    height: '8%',
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
  errorText: {
    color: 'red',
    zIndex: 1001,
    marginTop: -40,
    marginBottom: 20,
  },
});