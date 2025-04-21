import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { CodeField, Cursor } from "react-native-confirmation-code-field";
import { Alert } from "react-native";

import getLocalIP from "../../config";

let API_URL = "";
let API_URL2 = "";
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/verifyOTP`;
  API_URL2 = `${localIP}/verifyEmail`;
};
setupAPI();

export default function ValidateOTP({ navigation, route }) {
  const { email } = route.params; // Get the email from the route params
  const CELL_COUNT = 5;
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOTP = async () => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("value", value);
    console.log(value);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "OTP not matched. Please try again.");
        return;
      }

      navigation.navigate("ResetPassword");
    } catch (error) {
      const errorMessage = error.message || "Failed to verify OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email); // Send email as username to match backend

    try {
      const response = await fetch(API_URL2, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Email verification failed");
      }

      // Navigate to ResetPassword screen if verification succeeds
      //navigation.navigate("ValidateOTP", { email });
    } catch (error) {
      console.error("Email Verification Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
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

        <Text style={styles.header}>Verify OTP</Text>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 120,
          color: "#000",
          alignSelf:'center',
        }}
      >
        Check your email
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#666",
          textAlign: "center",
          marginVertical: 20,
        }}
      >
        We sent an OTP to {email}
        {"\n"}Enter 5 digit code that mentioned in the email
      </Text>
      <CodeField
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={{ marginVertical: 20 }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Text
            key={index}
            style={{
              width: 40,
              height: 40,
              lineHeight: 38,
              fontSize: 24,
              borderWidth: 2,
              borderColor: isFocused ? "#000" : "#ccc",
              textAlign: "center",
              marginHorizontal: 5,
              borderRadius: 5,
              alignSelf:'center',
            }}
          >
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleOTP}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
        Haven't got OTP yet?{" "}
        <TouchableOpacity onPress={handleEmailSubmit} disabled={isLoading}>
          <Text style={{ fontSize: 16, color: "#7A5BD0", marginBottom: -5, }}>
            {isLoading ? "Re-sending..." : "Re-send"}
          </Text>
        </TouchableOpacity>
      </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: "8%",
    width: "100%",
    textAlign: "center",
    //justifyContent: "center",
    //alignSelf:'center',
    //alignItems:'center'
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