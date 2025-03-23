import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useState, useEffect } from "react";
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  try {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/monthlyexpensessavings`;
  } catch (error) {
    console.error("Error setting up API URL:", error);
  }
};

// Call the function once to set the API URL
setupAPI();

export default function ExpensesGraph() {
  const [chartData, setChartData] = useState({
    expenses: Array(12).fill(0),
    savings: Array(12).fill(0),
    currentMonth: 0
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

  // Function to fetch expenses and savings data
  const fetchChartData = async () => {
    if (!userData.username || !API_URL) {
      //console.log("Waiting for username or API_URL:", { username: userData.username, API_URL });
      return;
    }
    //console.log("Fetching chart data for username:", userData.username);

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
        setChartData({
          expenses: data.data.expenses,
          savings: data.data.savings,
          currentMonth: data.data.currentMonth
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

  // Fetch chart data when username is available
  useEffect(() => {
    if (userData.username) {
      fetchChartData();
    }
  }, [userData.username]);

  // Helper to format tooltip data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const getTooltipData = (datasetIndex, pointIndex) => {
  const value = datasetIndex === 0 ? chartData.expenses[pointIndex] : chartData.savings[pointIndex];
    return `\u0930\u0941${Math.round(value)} ${months[pointIndex]}`; // Rupee symbol
  };

  return (
    <View style={styles.container}>
      <View style={styles.expensescontainer}>
        <Text style={styles.title}>Expenditure Figures</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <LineChart
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Expenses',
                  data: chartData.expenses,
                  color: () => `rgb(255, 89, 0)`, // Blue for expenses
                  strokeWidth: 2,
                },
                {
                  label: 'Saving',
                  data: chartData.savings,
                  color: () => `rgba(0, 204, 68, 1)`, // Green for savings
                  strokeWidth: 2,
                },
              ],
              legend: ["Expenses", "Saving"], // Add legend as in image
            }}
            width={Dimensions.get("window").width - 40}
            height={260}
            //yAxisLabel="\u0930\u0941" // Rupee symbol
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#FEDDDD",
              backgroundGradientFrom: "#FEDDDD",
              backgroundGradientTo: "#FEDDDD",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: (index) => (index === chartData.currentMonth ? "5" : "0"),
                strokeWidth: "2",
                stroke: "#FFA726",
                // Removed dynamic fill function; dots will use the dataset color
              },
              propsForBackgroundLines: {
                stroke: "transparent",
                strokeDasharray: "",
              },
              fillShadowGradient: "#F8EEE5",
              fillShadowGradientOpacity: 1,
              fromZero: true,
              yLabels: [0, 20000, 40000, 60000, 80000, 100000], // Adjusted scale
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 10,
              backgroundColor: "#F8EEE5",
            }}
            formatYLabel={(value) => {
              if (value >= 1000) {
                return `${value / 1000}k`; // Format as 1k, 2k, etc.
              }
              return value.toString();
            }}
            withDots={true}
            // Custom tooltip
            decorator={() => {
              const currentMonthIndex = chartData.currentMonth;
              const expensesValue = chartData.expenses[currentMonthIndex];
              const savingsValue = chartData.savings[currentMonthIndex];
              const maxValue = Math.max(expensesValue, savingsValue);
              if (maxValue === 0) return null;

              const xPosition = (currentMonthIndex + 0.5) * ((Dimensions.get("window").width - 40) / 12);
              const yPosition = (1 - (maxValue / 100000)) * 220; // Adjust based on chart height and max value

              return (
                <View
                  style={{
                    position: 'absolute',
                    left: xPosition - 50,
                    top: yPosition - 30,
                    backgroundColor: '#fff',
                    padding: 5,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 5,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#000' }}>
                    {`\u0930\u0941${Math.round(maxValue)} ${months[currentMonthIndex]}`}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#F8EEE5",
  },
  expensescontainer: {
    marginTop: 25,
    marginBottom: 100,
    padding: 10,
    backgroundColor: "#FEDDDD",
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#000",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});