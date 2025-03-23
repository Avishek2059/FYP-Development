import { Text, StyleSheet, View, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  try {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/monthlysavings`;
  } catch (error) {
    console.error("Error setting up API URL:", error);
  }
};

// Call the function once to set the API URL
setupAPI();

const screenWidth = Dimensions.get("window").width;
const chartHeight = 200;
const dotX = 240; // Fixed X-coordinate of the dot
const dotY = 30; // Fixed Y-coordinate of the dot

export default function DashboardSecondComp() {
  const [linePath, setLinePath] = useState("");
  const [savings, setSavings] = useState(0);
  const [difference, setDifference] = useState(0);
  const [monthlyData, setMonthlyData] = useState(null);
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
      }
    } catch (error) {
      //console.error('Error retrieving user data:', error);
      setError('Error retrieving user data');
    }
  };

  // Function to fetch monthly savings data
  const fetchMonthlyData = async () => {
    if (!userData.username || !API_URL) return;
    //console.log(userData.username)

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', userData.username);

      const response = await fetch(API_URL, {
        method: 'POST',
        body:formData,
        headers: {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMonthlyData(data.data);
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

  // Fetch user data and monthly data when component mounts
  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    if (userData.username) {
      fetchMonthlyData();
    }
  }, [userData.username]);

  // Update graph and savings when monthlyData changes
  useEffect(() => {
    if (monthlyData) {
      const currentSavings = monthlyData.income - monthlyData.expenses;
      setSavings(currentSavings);
      //le.log(currentSavings)

      if (monthlyData.lastMonth) {
        const lastSavings = monthlyData.lastMonth.income - monthlyData.lastMonth.expenses;
        setDifference(currentSavings - lastSavings);
      }

      const generatePath = () => {
        const maxSavings = monthlyData.income || 1;
        const scale = currentSavings / maxSavings;

        const points = [
          "M0,180",
          `Q30,${180 - scale * 150} 80,${90 + scale * 60}`,
          `Q100,${150 - scale * 60} 120,${100 + scale * 20}`,
          `Q130,${82 + scale * 18} 135,${100 - scale * 20}`,
          `Q150,${110 - scale * 30} ${dotX},${dotY}`,
          `L${screenWidth - 40},${dotY}`
        ];

        return points.join(" ");
      };

      setLinePath(generatePath());
    }
  }, [monthlyData]);

  return (
    <View>
      <View style={styles.savingsContainer}>
        <Text style={styles.headerText}>Monthly Saving</Text>

        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <View style={styles.savingtextStyle}>
              <Text style={[styles.savingsAmount, { fontSize: 40 }]}>{"\u0930\u0941"}</Text>
              <Text style={[styles.savingsAmount, { fontSize: 36 }]}>
                {savings.toLocaleString()}
              </Text>
            </View>

            {monthlyData?.lastMonth && (
              <View style={styles.savingtextStyle}>
                <FontAwesome
                  name={difference >= 0 ? "plus-circle" : "minus-circle"}
                  size={16}
                  color={difference >= 0 ? "#62C498" : "#FF6B6B"}
                />
                <Text style={[styles.savingsDescription, { fontSize: 18 }]}>{"\u0930\u0941"}</Text>
                <Text style={[styles.savingsDescription, { fontSize: 16 }]}>
                  {Math.abs(difference).toLocaleString()} {difference >= 0 ? "more" : "less"} than last month
                </Text>
              </View>
            )}

            <View style={styles.graphStyle}>
              <Svg height={chartHeight} width={screenWidth - 40}>
                <Path
                  d={linePath}
                  stroke="#00cc44"
                  strokeWidth="3"
                  fill="none"
                />
                <Circle
                  cx={dotX}
                  cy={dotY}
                  r="6"
                  fill="#00cc44"
                  stroke="white"
                  strokeWidth="3"
                />
              </Svg>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  savingsContainer: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  savingtextStyle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  savingsDescription: {
    color: "gray",
    zIndex: 101,
  },
  graphStyle: {
    marginTop: -60,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
