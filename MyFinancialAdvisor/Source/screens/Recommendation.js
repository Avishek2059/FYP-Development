import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";

//import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getLocalIP from "../../config";

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/recommendation`; // Set the global variable
  //console.log("API URL Set:", API_URL);
};

// Call the function once to set the API URL
setupAPI();

export default function Recommendation({ navigation }) {
  const [recommendation, setRecommendation] = useState(null);
  const [FinancialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
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
        // Parse the JSON string back to an object
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

  const fetchRecommendation = async () => {
    const formData = new FormData();
    formData.append("username", userData.username);

    setLoading(true);
    try {
      //console.log(API_URL);
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });
      const data = await response.json();
      setRecommendation({
        strategy: data.strategy,
        recommendation: data.recommendation
      });
      setFinancialData(data.monthly_data); // Set the financial data if needed
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      setRecommendation({
        strategy: "Error",
        recommendation: "Failed to fetch recommendation",
      });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("MFAUserDashboard")}
          //onPress={() => navigation.goBack()} // Uncomment if you want to go back to the previous screen
        >
          <Image
            source={require("../assets/arrow_back.png")} // Replace with your back arrow image
            style={styles.backButtonImage}
          />
        </TouchableOpacity>

        <Text style={styles.header}>Recommendation</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Get Recommendation</Text>
        <Text style={styles.subheading}>
          Here, You will be recommended a strategy based on your financial
          snapshot of last month.
        </Text>
        <View style={styles.section}>
        {FinancialData ? (
          Object.entries(FinancialData).map(([key, value]) => (
            <Text key={key}>
              {key}: {typeof value === 'number' ? value.toFixed(2) : value}
            </Text>
          ))
        ) : (
          <Text style={styles.subheading}>No financial data available</Text>
        )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={fetchRecommendation}
          disabled={loading} // Optional: disables button while submitting
        >
          <Text style={styles.buttonText}>
            {loading ? "Recommending" : "Recommendation"}
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        {recommendation && (
          <View style={styles.result}>
            <Text style={styles.messageText}>Recommendation</Text>
            <Text style={styles.strategy}>
              Strategy: {recommendation.strategy}
            </Text>
            <Text>{recommendation.recommendation}</Text>
          </View>
        )}
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
  section: {
    marginBottom: 20,
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
  buttonContainer: {
    marginVertical: 20,
  },
  result: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  strategy: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageText: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
});
