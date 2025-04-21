import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function SetBudget({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample categories for the dropdown, including "All"
  const categories = [
    { label: 'All', value: 'All' },
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

  // Budget periods for the dropdown
  const periods = [
    { label: 'Today', value: 'Today' },
    { label: 'Week', value: 'Week' },
    { label: 'Month', value: 'Month' },
  ];

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

  // Function to handle setting the budget
  const handleSetBudget = async () => {
    if (!selectedCategory) {
      alert('Please select a category for the budget!');
      return;
    }
    if (!selectedPeriod) {
      alert('Please select a period for the budget!');
      return;
    }
    if (!budgetAmount || isNaN(budgetAmount) || parseFloat(budgetAmount) <= 0) {
      alert('Please enter a valid budget amount!');
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // Mock API call or AsyncStorage save
      const budgetData = {
        category: selectedCategory,
        period: selectedPeriod,
        amount: parseFloat(budgetAmount),
        user: userData.username,
        timestamp: new Date().toISOString(),
      };

      // Save to AsyncStorage (or replace with actual API call)
      await AsyncStorage.setItem(`budget_${userData.username}_${selectedCategory}_${selectedPeriod}`, JSON.stringify(budgetData));
      
      setResponse({
        message: `Budget of ${budgetAmount} set for ${selectedCategory} for ${selectedPeriod}`,
      });
      
      // Clear inputs
      setBudgetAmount('');
      setSelectedCategory(null);
      setSelectedPeriod(null);
    } catch (error) {
      setError('Error setting budget: ' + error.message);
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
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets/arrow_back.png")} // Replace with your back arrow image
            style={styles.backButtonImage}
          />
        </TouchableOpacity>
        <Text style={styles.header}>Set Budget</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Set Your Budget</Text>
        <Text style={styles.subheading}>
          Choose a category and period to set your budget
        </Text>

        {/* Category Picker */}
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

        {/* Period Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPeriod}
            onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select Period" value="" />
            {periods.map((period) => (
              <Picker.Item
                key={period.value}
                label={period.label}
                value={period.value}
              />
            ))}
          </Picker>
        </View>

        {/* Budget Amount Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter Budget Amount"
          keyboardType="numeric"
          value={budgetAmount}
          onChangeText={setBudgetAmount}
        />

        {/* Set Budget Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSetBudget}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Setting Budget...' : 'Set Budget'}
          </Text>
        </TouchableOpacity>

        {/* Output Section */}
        <Text style={styles.outputLabel}>Budget Status:</Text>
        {response && (
          <View style={styles.successContainer}>
            <View style={styles.dataContainer}>
              <Text style={styles.messageText}>{response.message}</Text>
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
    fontSize: 14,
    color: "#555",
    marginBottom: 25,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#555',
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
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    width: '100%',
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
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});