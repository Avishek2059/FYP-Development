import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
//import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';
import { Picker } from '@react-native-picker/picker';


// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/predict`; // Set the global variable
    //console.log("API URL Set:", API_URL);
  };
  
  // Call the function once to set the API URL
  setupAPI();

export default function Prediction({ navigation }) {
    //const [query, setQuery] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

  // Sample categories for the dropdown
  const categories = [
    { label: 'Food', value: 'Food' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Housing', value: 'Housing' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Debt Payments', value: 'Debt Payments' },
    { label: 'Savings/Investments', value: 'Savings/Investments' },
    { label: 'Miscellaneous', value: 'Miscellaneous' },
  ];

  // Months for the month picker
  const months = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  // Years for the year picker (e.g., last 10 years up to the current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: `${currentYear - i}`,
  }));

    const [userData, setUserData] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: ''
      });
    
    // Function to get user data from AsyncStorage
    const getUserData = async () => {
    try {
        const storedData = await AsyncStorage.getItem('userSession');
        if (storedData !== null) {
        // Parse the JSON string back to an object
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        }
    } catch (error) {
      alert('Error retrieving user data:', error);
        console.error('Error retrieving user data:', error);
    }
    };

    // Use useEffect to fetch data when component mounts
    useEffect(() => {
    getUserData();
    }, []);
  
    // Function to handle the API call
    const handlePredict = async () => {
        if (selectedCategory=="Select Category") {
        alert('Please select a category for prediction!');
        return;
        }
        if (selectedMonth=="Select Month") {
        alert('Please select a Month for prediction!');
        return;
        }
        if (selectedYear=="Select Year") {
        alert('Please select a Year for prediction!');
        return;
        }
        //console.log(query)

        setLoading(true);
        setResponse(null); // Clear previous response
  
        const formData = new FormData();
        formData.append('selectedCategory', selectedCategory);
        formData.append('selectedMonth', selectedMonth);
        formData.append('selectedYear', selectedYear);
      

        try {
        //console.log(API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            body:formData,
            headers: {},
            });

            if (!response.ok) {
                const data = await response.json();
                console.log('Upload Error:', error);
                throw new Error(`${data.message}`);
                
            }
            const data = await response.json();
            console.log('Upload Response:', data);
            setResponse(data); // Store the data for display
        }
        catch (error) {
            //console.error('Upload Error:', error);
            setError(error.message);
        }
        finally {
            setLoading(false);
        }
    };
  
    return (
        <View style={styles.container}>
          {/* Back Button */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                >
                <Image
                    source={require("../assets/arrow_back.png")} // Replace with your back arrow image
                    style={styles.backButtonImage}
                />
                </TouchableOpacity>
        
                <Text style={styles.header}>Prediction</Text>
            </View>
    
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Make Expenses Prediction</Text>
        <Text style={styles.subheading}>
         Select a category of choice for prediction
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

        {/* Month and Year Pickers */}
        <View style={styles.datePickerRow}>
          {/* Month Picker */}
          <View style={[styles.pickerContainer, styles.datePicker]}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select Month" value="" />
              {months.map((month) => (
                <Picker.Item
                  key={month.value}
                  label={month.label}
                  value={month.value}
                />
              ))}
            </Picker>
          </View>

          {/* Year Picker */}
          <View style={[styles.pickerContainer, styles.datePicker]}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select Year" value="" />
              {years.map((year) => (
                <Picker.Item
                  key={year.value}
                  label={year.label}
                  value={year.value}
                />
              ))}
            </Picker>
          </View>
        </View>


        <TouchableOpacity
          style={styles.button}
          onPress={handlePredict}
          disabled={loading} // Optional: disables button while submitting
        >
          <Text style={styles.buttonText}>
            {loading ? 'Predicting' : 'Predict'}
          </Text>
        </TouchableOpacity>

        {/* Output Section */}
      <Text style={styles.outputLabel}>Predicted Output:</Text>
      {response && (
        <View style={styles.successContainer}>
          <View style={styles.dataContainer}>
            <Text style={styles.messageText}>Predicted: {response.prediction}</Text>
          </View>
        </View>
      )}

      {/* Display error if any */}
      {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
        </View>
      );
    };
    
    const styles = StyleSheet.create({

    container: {
    flex: 1,
    //justifyContent: "center",
    //alignItems: "center",
    padding: '8%',
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
    flex: 1, // 
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
    borderColor: '#555', // Cyan border color
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
    },
    picker: {
    height: 55,
    width: '100%',
    },
    pickerItem: {
    fontSize: 16,
    marginTop: -10,
    },
    datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    },
    datePicker: {
    width: '48%', // Adjust width to fit two pickers side by side with some spacing
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
    outputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    },
    successContainer: {
    marginTop: 8,
    },
    messageText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    },
    dataContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    },
    dataText: {
    fontSize: 14,
    marginBottom: 5,
    },
    errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    },
    });