import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getLocalIP from "../../config";
import { format } from "date-fns";

// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  try {
    const localIP = await getLocalIP();
    API_URL = `${localIP}/weeklystats`;
    //console.log("API URL Set for WeeklyStats:", API_URL);
  } catch (error) {
    console.error("Error setting up API URL:", error);
  }
};

// Call the function once to set the API URL
setupAPI();

export default function WeeklyStats() {
  const [chartData, setChartData] = useState({
    income: Array(7).fill(0),
    expenses: Array(7).fill(0),
    start_date: new Date(),
    end_date: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("income"); // 'income' or 'expenses'
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    return new Date(today.setDate(today.getDate() - dayOfWeek)); // Start of the week (Sunday)
  });

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
        //console.log("User Data Retrieved:", parsedData);
      } else {
        setError("No user session found");
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
      setError("Error retrieving user data");
    }
  };

  // Function to fetch weekly stats
  const fetchChartData = async (weekStart) => {
    if (!userData.username || !API_URL) {
      console.log("Waiting for username or API_URL:", {
        username: userData.username,
        API_URL,
      });
      return;
    }
    //console.log("Fetching chart data for username:", userData.username);

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", userData.username);
      formData.append("start_date", weekStart.toISOString().split("T")[0]); // Format: YYYY-MM-DD

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      //console.log("Raw Response:", text);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text || "Failed to fetch data");
        }
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data = JSON.parse(text);
      //console.log("Parsed Data:", data);

      if (data.status === "success") {
        setChartData({
          income: data.data.income,
          expenses: data.data.expenses,
          start_date: new Date(data.data.start_date),
          end_date: new Date(data.data.end_date),
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    getUserData();
  }, []);

  // Fetch chart data when username or week changes
  useEffect(() => {
    if (userData.username) {
      fetchChartData(currentWeekStart);
    }
  }, [userData.username, currentWeekStart]);

  // Navigation handlers
  const handlePrevWeek = () => {
    setCurrentWeekStart(
      new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7))
    );
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(
      new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7))
    );
  };

  // Calculate total for the selected mode
  const total =
    mode === "income"
      ? chartData.income.reduce((sum, value) => sum + value, 0)
      : chartData.expenses.reduce((sum, value) => sum + value, 0);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        {/* Start and End date */}
        <Text style={styles.dateRange}>
          {format(chartData.start_date, "MMM d")} -{" "}
          {format(chartData.end_date, "MMM d")}
        </Text>

        {/* Total and Title */}
        <Text style={styles.title}>
          {mode === "income" ? "Total Income" : "Total Expense"}
        </Text>
        <Text style={styles.total}>
          {`\u0930\u0941${total.toFixed(2)}`} {/* Rupee symbol */}
        </Text>

        {/* Bar Chart */}
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <BarChart
            data={{
              labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              datasets: [
                {
                  data:
                    mode === "income" ? chartData.income : chartData.expenses,
                },
              ],
            }}
            width={Dimensions.get("window").width - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#C0DEDC",
              backgroundGradientFrom: "#C0DEDC",
              backgroundGradientTo: "#C0DEDC",
              decimalPlaces: 0,
              color: (opacity = 1) =>
                mode === "income"
                  ? `rgba(0, 204, 68, ${opacity})`
                  : `rgba(255, 99, 132, ${opacity})`, // Green for income, red for expenses
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForBackgroundLines: {
                stroke: "transparent", // Remove grid lines
                strokeDasharray: "",
              },
              fillShadowGradient: "#62C498",
              fillShadowGradientOpacity: 1,
              fromZero: true,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 10,
              backgroundColor: "#C0DEDC",
              marginLeft:-10,
            }}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            showBarTops={false}
            withInnerLines={false}
          />
        )}

        {/* Toggle Buttons */}

        <View>
          {/* Date Range and Navigation */}
          <View style={styles.header}>
            <TouchableOpacity 
            style={styles.navback}
            onPress={handlePrevWeek}>
              <Text style={styles.navArrow}>{"<"}</Text>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              mode === "income" && styles.activeButton,
            ]}
            onPress={() => setMode("income")}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "income" && styles.activeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              mode === "expenses" && styles.activeButton,
            ]}
            onPress={() => setMode("expenses")}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "expenses" && styles.activeText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

            <TouchableOpacity 
            style={styles.navback}
            onPress={handleNextWeek}>
              <Text style={styles.navArrow}>{">"}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C0DEDC",
    marginTop: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 8,
    //marginBottom: 100,
    padding: 10,
    backgroundColor: "#C0DEDC",
    borderRadius: 10,
    //marginLeft:-20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding:8,
  },
  navback:{
    width:50,
    height:50,
    backgroundColor: "#FFFFFF",
    borderRadius:36,
  },
  navArrow: {
    textAlign:'center',
    marginTop: -10,
    fontSize: 36,
    color: "#717070",
    padding:8,
    borderRadius: 36,
  },
  dateRange: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    //textAlign: "center",
    color: "#7A797D",
  },
  total: {
    fontSize: 28,
    fontWeight: "bold",
    //textAlign: "center",
    color: "#000",
    //marginVertical: 10,
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    //marginTop: 10,
    backgroundColor:'#FFFFFF',
    padding:4,
    borderRadius: 8,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    //marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  activeButton: {
    backgroundColor: "#C0DEDC",
  },
  toggleText: {
    fontSize: 16,
    color: "#000",
  },
  activeText: {
    color: "#000",
  },
});
