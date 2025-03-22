import React, { useState, useEffect } from "react";
import { set } from "react-hook-form";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/sqlquery`; // Set the global variable
    //console.log("API URL Set:", API_URL);
  };
  
  // Call the function once to set the API URL
  setupAPI();

export default function SqlQuery({ navigation}) {
    const [query, setQuery] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
    const handleFetch = async () => {
      if (!query.trim()) {
        alert('Please enter a query!');
        return;
      }
      //console.log(query)
  
      setLoading(true);
      setResponse(''); // Clear previous response
  
      const formData = new FormData();
      formData.append('query', query);
      formData.append('username', userData.username);

        try {
        //console.log(API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            body:formData,
            headers: {},
        });

        if (!response.ok) {
            const data = await response.json();
            //console.log('Upload Error:', error);
            throw new Error(`${data.message}`);
            
        }
        const data = await response.json();
        //console.log('Upload Response:', data);
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
  
    // Function to render data dynamically
  const renderData = (data) => {
    if (!data || data.length === 0) return <Text>No data available</Text>;

    // If data is an array of objects (e.g., list of expenses)
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <View key={index} style={styles.dataItem}>
          {Object.entries(item).map(([key, value]) => (
            <Text key={key} style={styles.dataText}>
              {key}: {value}
            </Text>
          ))}
        </View>
      ));
    }

    // If data is a single object (e.g., total_expenses)
    return (
      <View style={styles.dataItem}>
        {Object.entries(data[0]).map(([key, value]) => (
          <Text key={key} style={styles.dataText}>
            {key}: {value}
          </Text>
        ))}
      </View>
    );
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
        
                <Text style={styles.header}>Query</Text>
            </View>
    
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Get Your Analytics</Text>
        <Text style={styles.subheading}>
          Write a prompt to get fetch from database
        </Text>
        <Text style={styles.note}>
          Note: Write a prompt meaningful as much as possible
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Eg: List out my expenses details..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
        />

        {/* <TouchableOpacity style={styles.button} onPress={handleFetch}>
          <Text style={styles.buttonText}>Fetch</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.button}
          onPress={handleFetch}
          disabled={loading} // Optional: disables button while submitting
        >
          <Text style={styles.buttonText}>
            {loading ? 'Fetching' : 'Fetch'}
          </Text>
        </TouchableOpacity>

        {/* Output Section */}
      <Text style={styles.outputLabel}>Output:</Text>
      {response && (
        <View style={styles.successContainer}>
          <View style={styles.dataContainer}>
            <Text style={styles.messageText}>Message: {response.message}</Text>
            {renderData(response.data)}
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
        marginLeft: -15, 
      },
      header: {
        fontSize: 18, 
        fontWeight: "bold", 
        textAlign: "center", 
        flex: 1, // 
      },
      heading: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
        marginTop: "35%",
      },
      subheading: {
        textAlign: "center",
        fontSize: 18,
        color: "#555",
        marginBottom: 5,
      },
      note: {
        textAlign: "center",
        fontSize: 14,
        color: "#EF6E40",
        marginBottom: 15,
      },
      input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
        paddingVertical: 14,
      },
      button: {
        width: "60%",
        backgroundColor: "#7A5BD0",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        //justifyContent: "center",
        //justifyItems: "center",
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