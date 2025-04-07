import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useState, useEffect } from "react";
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';
import { format } from 'date-fns';

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  try {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/categoryexpenses`;
    //console.log("API URL Set for CategoryExpenses:", API_URL);
  } catch (error) {
    console.error("Error setting up API URL:", error);
  }
};

// Call the function once to set the API URL
setupAPI();

export default function CategoryExpenses() {
  const [chartData, setChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
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

  // Function to fetch category expenses
  const fetchChartData = async (date) => {
    if (!userData.username || !API_URL) {
      console.log("Waiting for username or API_URL:", { username: userData.username, API_URL });
      return;
    }
    //console.log("Fetching chart data for username:", userData.username);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('selected_date', date.toISOString().split('T')[0]); // Format: YYYY-MM-DD

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
        setChartData(data.data.categories);
        setSelectedDate(new Date(data.data.selected_date));
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
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
      fetchChartData(selectedDate);
    }
  }, [userData.username]);

  // Calculate total expenses
  const totalExpenses = chartData.reduce((sum, category) => sum + category.expense, 0);

  // Find the largest category for the tooltip
  const largestCategory = chartData.reduce((max, category) => 
    category.expense > (max.expense || 0) ? category : max, { expense: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.expensesContainer}>
        {/* Date */}
        <Text style={styles.date}>
          {format(selectedDate, 'MMMM dd, yyyy')}
        </Text>

        {/* Total Expenses */}
        <Text style={styles.total}>
          {`\u0930\u0941${totalExpenses.toFixed(2)}`} {/* Rupee symbol */}
        </Text>

        

        <View>

            {/* Pie Chart */}
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData.map(category => ({
                name: category.name,
                population: category.expense || 0.01, // Ensure non-zero for visibility
                color: category.color,
                legendFontColor: "#000",
                legendFontSize: 15
              }))}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#F8EEE5",
                backgroundGradientFrom: "#F8EEE5",
                backgroundGradientTo: "#F8EEE5",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 10]}
              absolute
              hasLegend={false} // We'll create a custom legend
              style={{
                marginVertical: 8,
                borderRadius: 10,
                marginLeft:50,
              }}
            />
          </View>
        )}

        </View>

        {/* Custom Legend */}
        <View style={styles.legendContainer}>
          {chartData.map((category, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: category.color }]} />
              <Text style={styles.legendText}>{category.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6DFF1",
    borderRadius: 10,
    marginBottom: 100,
  },
  expensesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E6DFF1",
    borderRadius: 10,
    //alignItems: 'center',
  },
  date: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
    fontWeight: "bold",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#69686B",
    marginBottom: 20,
  },
  chartContainer: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    right: 20,
    top: 80,
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
  },
  tooltipText: {
    fontSize: 12,
    color: '#000',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#000',
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