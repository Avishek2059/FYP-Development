import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getLocalIP from "../../config";
import { Picker } from "@react-native-picker/picker";

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/addincome`; // Updated to /addincome
  //console.log("API URL Set:", API_URL);
};

// Call the function once to set the API URL
setupAPI();

export default function AddIncome({ navigation }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryError, setQueryError] = useState(""); // For input validation error
  const [selectedCategory, setSelectedCategory] = useState("");

  // Sample categories for the dropdown
  const categories = [
    { label: "Salary", value: "Salary" },
    { label: "Freelancing", value: "Freelancing" },
    { label: "Investments", value: "Investments" },
    { label: "Business Profits", value: "Business Profits" },
    { label: "Rental Income", value: "Rental Income" },
    { label: "Dividends", value: "Dividends" },
    { label: "Royalties", value: "Royalties" },
    { label: "Bonuses", value: "Bonuses" },
    { label: "Side Hustle", value: "Side Hustle" },
  ];

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

  // Validate the income amount
  const validateQuery = (value) => {
    const numValue = parseFloat(value);
    if (!value) {
      return "Income amount is required";
    } else if (isNaN(numValue)) {
      return "Please enter a valid number";
    } else if (numValue <= 0) {
      return "Income amount must be greater than 0";
    }
    return "";
  };

  // Handle TextInput change with validation
  const handleQueryChange = (text) => {
    setQuery(text);
    const validationError = validateQuery(text);
    setQueryError(validationError);
  };

  // Function to handle the API call
  const addIncomes = async () => {
    // Validate category
    if (!selectedCategory) {
      alert("Please select a category for the income!");
      return;
    }

    // Validate query (income amount)
    const validationError = validateQuery(query);
    setQueryError(validationError);
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    setResponse(null); // Clear previous response
    setError(null); // Clear previous error

    const formData = new FormData();
    formData.append("category", selectedCategory); // Changed to "category" for clarity
    formData.append("username", userData.username);
    formData.append("amount", query); // Changed to "amount" for clarity
    
    //console(API_URL)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add income");
      }

      const data = await response.json();
      //.log("Add Income Response:", data);
      setResponse(data); // Store the data for display
    } catch (error) {
      console.error("Add Income Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

        <Text style={styles.header}>Add Income</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Add Income</Text>
        <Text style={styles.subheading}>
          Select a category from where you earned
        </Text>

        {/* Dropdown Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((category) => (
              <Picker.Item
                key={category.value}
                label={category.label}
                value={category.value}
              />
            ))}
          </Picker>
        </View>

        {/* Income Amount Input */}
        <View>
          <TextInput
            style={[styles.input, queryError && styles.inputError]}
            placeholder="Rs. 20000"
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleQueryChange}
            keyboardType="numeric" // Restrict to numeric input
          />
          {queryError ? (
            <Text style={styles.errorText}>{queryError}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={addIncomes}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Adding..." : "Add"}</Text>
        </TouchableOpacity>

        {/* Success Message */}
        {response && (
          <View style={styles.successContainer}>
            <View style={styles.dataContainer}>
              <Text style={styles.messageText}>Income added successfully!</Text>
              <Text>Invoice: {response.invoice_number}</Text>
              <Text>Date: {response.invoice_date}</Text>
              <Text>Amount: Rs. {response.income}</Text>
            </View>
          </View>
        )}

        {/* Display error if any */}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 5,
    width: "100%",
    marginBottom: 20,
  },
  picker: {
    height: 55,
    width: "100%",
  },
  pickerItem: {
    fontSize: 16,
    marginTop: -10,
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
  successContainer: {
    marginTop: 8,
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
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
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
  inputError: {
    borderColor: "red",
  },
});
