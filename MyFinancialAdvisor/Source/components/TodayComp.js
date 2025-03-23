import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Svg, { Path, Circle } from "react-native-svg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocalIP from '../../config';

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  try {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/todaystats`;
    //console.log("API URL Set for TodayComp:", API_URL);
  } catch (error) {
    //console.error("Error setting up API URL:", error);
  }
};

// Call the function once to set the API URL
setupAPI();

const CircularProgressWithImage = ({ progress, color, icon, value, label }) => {
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progressValue = (circumference * progress) / 100;

  return (
    <View style={styles.progressContainer}>
      <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
        {/* Background Circle */}
        <Circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progressValue}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {/* Icon Inside Circle */}
      <View style={[styles.iconContainerToday, { width: radius * 2, height: radius * 2 }]}>
        <Image source={icon} style={styles.iconToday} />
      </View>
      {/* Value and Label */}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default function TodayComp() {
  const [todayData, setTodayData] = useState({
    expenses: 0,
    income: 0,
    expenseProgress: 0,
    incomeProgress: 0
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

  // Function to fetch today's stats
  const fetchTodayStats = async () => {
    if (!userData.username || !API_URL) {
      //console.log("Waiting for username or API_URL:", { username: userData.username, API_URL });
      return;
    }
    //console.log("Fetching today’s stats for username:", userData.username);

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
        setTodayData({
          expenses: data.data.expenses,
          income: data.data.income,
          expenseProgress: data.data.expenseProgress,
          incomeProgress: data.data.incomeProgress
        });
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

  // Fetch today’s stats when username is available
  useEffect(() => {
    if (userData.username) {
      fetchTodayStats();
    }
  }, [userData.username]);

  return (
    <View>
      <View style={styles.todayContainers}>
        <Text style={styles.todaytitle}>Today's</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.todayrow}>
            {/* Expenses */}
            <CircularProgressWithImage
              progress={todayData.expenseProgress}
              color="#0062FF"
              icon={require("../assets/expenses.png")} // Ensure this path is correct
              value={todayData.expenses.toLocaleString()}
              label="Expenses"
            />
            {/* Savings (using income as savings here) */}
            <CircularProgressWithImage
              progress={todayData.incomeProgress}
              color="#00cc44"
              icon={require("../assets/saving.png")} // Ensure this path is correct
              value={todayData.income.toLocaleString()}
              label="Saving"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todayContainers: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8EEE5",
    marginTop: 25,
    paddingBottom: 20,
    borderRadius: 30,
  },
  todaytitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  todayrow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  progressContainer: {
    alignItems: "center",
  },
  iconContainerToday: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  iconToday: {
    width: 60,
    height: 60,
    marginTop: 10,
    resizeMode: "contain",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: "#808080",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});