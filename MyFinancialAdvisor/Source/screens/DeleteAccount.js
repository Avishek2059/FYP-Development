import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getLocalIP from "../../config";

// API URL setup
let API_URL = "";
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/deleteaccount`;
};
setupAPI();

export default function DeleteAccount({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //const [sessionUser, setSessionUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
  });

  // Function to get user data from AsyncStorage
  const getUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userSession");
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      }
    } catch (error) {
      alert("Error retrieving user data:", error);
      console.error("Error retrieving user data:", error);
    }
  };

  // Use useEffect to fetch data when component mounts
  useEffect(() => {
    getUserData();
  }, []);

  // Handle username submission
  const handleUsernameSubmit = () => {
    if (!username) {
      setError("Please enter a username");
      return;
    }
    if (username === userData.username) {
      setShowPasswordField(true);
      setError(null);
    } else {
      setError("Username doesn't match session user");
    }
  };

  // Handle account deletion
  const deleteAccount = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      const data = await response.json();
      setSuccess(data.message);

      // Clear session and navigate to login
      await AsyncStorage.removeItem("userSession");
      navigation.navigate("MFALoginScreen"); // Assuming you have a Login screen
    } catch (error) {
      console.error("Delete Account Error:", error);
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
        <Text style={styles.header}>Delete Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Delete Account</Text>
        <Text style={styles.subheading}>This action cannot be undone</Text>

        {/* Username Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          editable={!showPasswordField}
        />

        {!showPasswordField && (
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUsernameSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Checking..." : "Verify Username"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Password Input - Shown only after username verification */}
        {showPasswordField && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={deleteAccount}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Deleting..." : "Delete Account"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Success Message */}
        {success && <Text style={styles.successText}>{success}</Text>}

        {/* Error Message */}
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
    backgroundColor: "#FF4444",
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
  successText: {
    color: "green",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});
