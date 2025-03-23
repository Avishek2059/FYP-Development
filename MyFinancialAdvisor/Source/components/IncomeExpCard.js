import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  try {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/incomeexpenses`;
    //console.log("API URL Set for IncomeExpCard:", API_URL);
  } catch (error) {
    //console.error("Error setting up API URL:", error);
  }
};

// Call the function once to set the API URL
setupAPI();

export default function IncomeExpCard() {
  const [incomeData, setIncomeData] = useState({
    currentIncome: 0,
    currentExpenses: 0,
    lastIncome: 0,
    lastExpenses: 0,
    incomePercentage: 0,
    expensePercentage: 0
  });
  const [loading, setLoading] = useState(true);
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
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        //console.log("User Data Retrieved:", parsedData);
      } else {
        setError("No user session found");
      }
    } catch (error) {
      //console.error('Error retrieving user data:', error);
      setError('Error retrieving user data');
    }
  };

  // Function to fetch income and expense data
  const fetchIncomeExpenseData = async () => {
    if (!userData.username || !API_URL) {
      //console.log("Waiting for username or API_URL:", { username: userData.username, API_URL });
      return;
    }
    //console.log("Fetching data for username:", userData.username);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', userData.username);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      //console.log("Raw Response:", text);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text || 'Failed to fetch data');
        }
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = JSON.parse(text);
      //console.log("Parsed Data:", data);

      if (data.status === 'success') {
        setIncomeData({
          currentIncome: data.data.current.income,
          currentExpenses: data.data.current.expenses,
          lastIncome: data.data.lastMonth.income,
          lastExpenses: data.data.lastMonth.expenses,
          incomePercentage: data.data.percentage.income,
          expensePercentage: data.data.percentage.expenses
        });
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      //console.error('Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getUserData();
  }, []);

  // Fetch income/expense data when username is available
  useEffect(() => {
    if (userData.username) {
      fetchIncomeExpenseData();
    }
  }, [userData.username]);

  return (
    <View>
      <View style={styles.cardContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <View style={styles.cardIncome}>
              <View style={styles.cardTitlecontainer}>
                <Text style={styles.cardTitle}>
                  Income{" "}
                  <Text style={styles.percentageText}>
                    {incomeData.incomePercentage >= 0 ? '+' : ''}{incomeData.incomePercentage}%
                  </Text>
                </Text>
              </View>
              <Text style={styles.cardAmount}>{'\u0930\u0941'} {incomeData.currentIncome.toLocaleString()}</Text>
              <Text style={styles.cardDescription}>
                Compared to {"\n"}{'\u0930\u0941'} {incomeData.lastIncome.toLocaleString()} last month
              </Text>
            </View>
            <View style={styles.cardExpenditure}>
              <View style={styles.cardTitlecontainer}>
                <Text style={styles.cardTitle}>
                  Expenditure{" "}
                  <Text style={styles.percentageText}>
                    {incomeData.expensePercentage >= 0 ? '+' : ''}{incomeData.expensePercentage}%
                  </Text>
                </Text>
              </View>
              <Text style={styles.cardAmount}>{'\u0930\u0941'} {incomeData.currentExpenses.toLocaleString()}</Text>
              <Text style={styles.cardDescription}>
                Compared to {"\n"}{'\u0930\u0941'} {incomeData.lastExpenses.toLocaleString()} last month
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardIncome: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#C0DEDC',
    borderRadius: 16,
  },
  cardExpenditure: {
    flex: 1,
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#E6DFF1',
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  cardTitlecontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageText: {
    color: "#EF6E40", // Orange color for percentage
    fontSize: 13,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cardDescription: {
    color: 'gray',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});