import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import getLocalIP from "../../config";

let API_URL = "";
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/verifyEmail`;
};
setupAPI();

export default function ForgetPassword({navigation}) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handleEmailSubmit = async () => {
      if (!email) {
        setError("Please enter your email");
        return;
      }
  
      // Basic email format validation
      const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      const formData = new FormData();
      formData.append("email", email); // Send email as username to match backend
  
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          body: formData,
          headers: {}
        });
  
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Email verification failed");
        }
  
        // Navigate to ResetPassword screen if verification succeeds
        navigation.navigate("ValidateOTP", { email });
  
      } catch (error) {
        console.error("Email Verification Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../assets/arrow_back.png")}
              style={styles.backButtonImage}
            />
          </TouchableOpacity>
          <Text style={styles.header}>Forgot Password</Text>
        </View>
  
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.subheading}>
            Enter your email to reset your password
          </Text>
  
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
  
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleEmailSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify Email"}
            </Text>
          </TouchableOpacity>
  
          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: "8%",
      width: "100%",
    },
    headerContainer: {
      position: "absolute",
      top: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonImage: {
      width: 70,
      height: 24,
      resizeMode: "contain",
    },
    header: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      flex: 1,
    },
    heading: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 5,
      marginTop: "35%",
    },
    subheading: {
      textAlign: "center",
      fontSize: 16,
      color: "#555",
      marginBottom: 25,
    },
    input: {
      borderWidth: 1,
      borderColor: "#555",
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      marginBottom: 20,
      paddingVertical: 14,
      height: 55,
    },
    button: {
      width: "60%",
      backgroundColor: "#7A5BD0",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      alignSelf: "center",
      marginBottom: 20,
    },
    buttonDisabled: {
      backgroundColor: "#A0A0A0",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    errorText: {
      color: "red",
      fontSize: 16,
      textAlign: "center",
      marginTop: 10,
    },
  });