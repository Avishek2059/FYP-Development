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

let API_URL = "";
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/verifyuser`;
};
setupAPI();

export default function ChangePassword({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //const [sessionUser, setSessionUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const verifyPassword = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);

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
        throw new Error(data.message || "Password verification failed");
      }

      // Navigate to UpdatePassword screen if verification succeeds
      navigation.navigate("UpdatePassword", { username });

    } catch (error) {
      console.error("Verify Password Error:", error);
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
        <Text style={styles.header}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Change Password</Text>
        <Text style={styles.subheading}>
          Verify your identity first
        </Text>

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

        {showPasswordField && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={verifyPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verifying..." : "Verify Password"}
              </Text>
            </TouchableOpacity>
          </>
        )}

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