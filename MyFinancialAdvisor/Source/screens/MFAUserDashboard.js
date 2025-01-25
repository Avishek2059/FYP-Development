import React, {useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Button} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Using Expo icons for simplicity
import { LineChart } from 'react-native-chart-kit'; // For the graph
import Header from "../components/Header";
import Svg, { Path, Circle, Defs, Filter, FeDropShadow } from "react-native-svg";

const screenWidth = Dimensions.get('window').width;
const chartHeight = 200;
//const linePath = "M0,150 Q100,50 200,80 T400,70"; // Example path for a curve
// Complex upward and downward curve path
const linePath = "M0,180 Q30,30 80,90 Q100,150 120,100 Q130,82 135,100 Q150,110 150,80 Q160,80 170,60 Q180,50 190,50 Q200,60 240,30 Q233,30 400,30";//top/down left/right adn

const dotX = 240; // X-coordinate of the dot
const dotY = 30; // Y-coordinate of the dot

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
          stroke="#e6e6e6" // Background circle color
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke={color} // Progress circle color
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




export default function MFAUserDashboard({route, navigation}) {

    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');

    // for expenditure section
    const [chartData, setChartData] = useState(null); // State to store backend data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    //const currentMonth = new Date().getMonth(); // Get the current month (0-11)
    const currentMonth= "May";
    useEffect(() => {
      // Function to fetch data from the backend
      const fetchData = async () => {
        try {
          const response = await fetch("https://your-backend-api.com/getChartData");
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const data = await response.json();
  
          setChartData({
            expenses: data.expenses, // Expenses data from backend
            savings: data.savings, // Savings data from backend
          });
          setLoading(false);
        } catch (error) {
          setLoading(false);
          setError(error.message);
        }
      };
  
      fetchData();
    }, []);
  
    const handleRetry = () => {
      setLoading(true);
      setError(null);
      fetchData();
    };

    return (
        
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            {/* Profile Image on the Left */}
            <Image
              source={require('../assets/Avishek Chaudhary.jpg')}
              style={styles.profileImage}
            />

            {/* Middle Space for Search Bar or Empty Space */}
              {isSearching ? (
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setIsSearching(false)}>
                    <MaterialIcons name="close" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              
            ) : (
              <View style={styles.middleSpace} />
            )}

            {/* Icons on the Right */}
            <View style={styles.rightIcons}>
              {!isSearching && (
                <TouchableOpacity onPress={() => setIsSearching(true)}>
                  <MaterialIcons name="search" size={28} color="black" />
                </TouchableOpacity>
              )}
              <TouchableOpacity>
                <MaterialIcons name="notifications" size={28} color="black" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="menu" size={28} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
          showsVerticalScrollIndicator={false} // Hides the vertical scroll bar
          contentContainerStyle={{ flexGrow: 1 }}>
          {/* Monthly Savings */}
          <View style={styles.savingsContainer}>
              <Header style={{fontSize:20,fontWeight: 'bold'}}>Monthly Saving</Header>
            <View style={styles.savingtextStyle}>
              <Text style={[styles.savingsAmount, { fontSize: 40 }]}>
                {'\u0930\u0941'}
              </Text>
              <Text style={[styles.savingsAmount, { fontSize: 36 }]}>
                12,225
              </Text>
            </View>
            <View style={styles.savingtextStyle}>
            {/* <FontAwesome icon={faPlusCircle} size="lg" color="black" /> */}
            <FontAwesome name="plus-circle" size={16} color="#62C498" solid={false} />
              <Text style={[styles.savingsDescription, { fontSize: 18 }]}>
                {'\u0930\u0941'}
              </Text>
              <Text style={[styles.savingsDescription, { fontSize: 16 }]}>
                225 more than last month
              </Text>
            </View>
    
            {/* Graph */}
            <View style={styles.graphStyle}>
              <Svg
                height={chartHeight}
                width={screenWidth - 40} // Adjust width to fit your layout
              >
                {/* Line */}
                <Path
                  d={linePath}
                  stroke="#00cc44" // Line color
                  strokeWidth="3"
                  fill="none"
                />
                {/* Dot */}
                <Circle
                  cx={dotX}
                  cy={dotY}
                  r="6" // Dot size
                  fill="#00cc44" // Dot color
                  stroke="white"
                  strokeWidth="3"
                />
              </Svg>
            </View>
          </View>
    
          {/* Income and Expenditure Cards */}
          <View style={styles.cardContainer}>
            <View style={styles.cardIncome}>
            <View style={styles.cardTitlecontainer}>
              <Text style={styles.cardTitle}>
                Income{" "}
                <Text style={styles.percentageText}>
                  +0.25%
                </Text>
              </Text>
            </View>
              <Text style={styles.cardAmount}>{'\u0930\u0941'} 10,289</Text>
              <Text style={styles.cardDescription}>Compared to {"\n"}{'\u0930\u0941'} 10,289 last month</Text>
            </View>
            <View style={styles.cardExpenditure}>
            <View style={styles.cardTitlecontainer}>
              <Text style={styles.cardTitle}>
                Expenditure{" "}
                <Text style={styles.percentageText}>
                  +0.25%
                </Text>
              </Text>
            </View>
              <Text style={styles.cardAmount}>{'\u0930\u0941'} 10,289</Text>
              <Text style={styles.cardDescription}>Compared to {"\n"}{'\u0930\u0941'} 10,289 last month</Text>
            </View>
          </View>
    
          {/* Today's Stats */}
          <View style={styles.todayContainers}>
            <Text style={styles.todaytitle}>Today's</Text>
            <View style={styles.todayrow}>
              {/* Expenses */}
              <CircularProgressWithImage
                progress={60}
                color="#0062FF"
                icon={require("../assets/expenses.png")} // Replace with your icon path
                value="235"
                label="Expenses"
              />
              {/* Savings */}
              <CircularProgressWithImage
                progress={40}
                color="#00cc44"
                icon={require("../assets/saving.png")} // Replace with your icon path
                value="100"
                label="Saving"
              />
            </View>
          </View>

          {/* Expenditure Figures */}
      <View style={styles.expensescontainer}>
      <Text style={styles.title}>Expenditure Figures</Text>
      <LineChart
        data={{
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // Fixed labels
          datasets: [
            {
              label: 'Expenses', // Optional: Add a label for the dataset
              data: [1200, 2300, 1500, 3200, 2500, 1800, 4000, 4500, 3000, 3500, 2000, 4200], // Example data for each month
              color: () => `rgba(0, 122, 255, 1)`, // Blue for expenses
              strokeWidth: 2,
            },
            {
              label: "Revenue", // Second dataset
              data: [
                2000, 2500, 1800, 3500, 3000, 2800, 5000, 4700, 3300, 4000, 2500, 4800,
              ],
              color: () => `rgba(255, 99, 132, 1)`, // Red line
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get("window").width - 40} // Chart width
        height={260}
        yAxisLabel="$" // Prefix for Y-axis values
        yAxisSuffix="" // Optional suffix for Y-axis
        yAxisInterval={1} // Y-axis interval
        chartConfig={{
          backgroundColor: "#F8EEE5",
          backgroundGradientFrom: "#F8EEE5",
          backgroundGradientTo: "#F8EEE5",
          decimalPlaces: 0, // No decimals
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Axis color
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
          propsForDots: {
            r: ({ index }) => (index === currentMonth ? "5" : "0"), // Show dot only for the current month
            strokeWidth: "2",
            stroke: "#ffa726", // Dot stroke color
          },
        }}
        bezier // Makes the curve smooth
        style={{
          //paddingTop: 20,
          marginVertical: 8,
          borderRadius: 10,
        }}
      />
      </View>
      </ScrollView> 
















        {/* Curved Background with Camera Placeholder */}
      <View style={styles.navBarContainer}>
        <Svg
          width={screenWidth}
          height={80}
          viewBox={`0 0 ${screenWidth} 80`}
          style={styles.curveSvg}
        >
          <Path
            d={`M0,0
              H${screenWidth / 2 - 60}
              C${screenWidth / 2 - 40},10 ${screenWidth / 2 - 5},95 ${screenWidth / 2 + 50},0
              H${screenWidth / 2 + 60}
              C${screenWidth / 2 + 40},-10 ${screenWidth / 2 + 5},-95 ${screenWidth},0
              V80 H0 Z`}
            fill="white"
          />
        </Svg>
      </View>
          {/* Bottom Navigation */}
          <View style={styles.navBarContainer}>
            {/* Curved Navigation Bar */}
                <View style={[styles.navBar, { width: screenWidth }]}>
                  {/* Home Icon */}
                  <TouchableOpacity style={styles.iconContainer}>
                    <Image
                      source={require("../assets/home.png")} // Replace with your icon path
                      style={styles.icon}
                    />
                  </TouchableOpacity>

                  {/* Stats Icon */}
                  <TouchableOpacity style={[styles.iconContainer, { marginRight: 50 }]}>
                    <Image
                      source={require("../assets/insight.png")} // Replace with your icon path
                      style={styles.icon}
                    />
                  </TouchableOpacity>

                  {/* Barcode Icon */}
                  <TouchableOpacity style={styles.iconContainer}>
                    <Image
                      source={require("../assets/query.png")} // Replace with your icon path
                      style={styles.icon}
                    />
                  </TouchableOpacity>

                  {/* Profile Icon */}
                  <TouchableOpacity style={styles.iconContainer}>
                    <Image
                      source={require("../assets/user.png")} // Replace with your icon path
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>

                {/* Elevated Camera Button */}
                <View style={styles.cameraButtonContainer}>
                  <TouchableOpacity style={styles.cameraButton}>
                    <Image
                      source={require("../assets/camera.png")} // Replace with your camera icon path
                      style={styles.cameraIcon}
                    />
                  </TouchableOpacity>
                </View>
            </View>

                
        </View>
        
      );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      marginTop: 20,
      height: 60,
      //backgroundColor: '#fff',
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 30,
    },
    middleSpace: {
      flex: 1,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 10,
      marginLeft: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 10,
    },
    rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    savingsContainer: {
      marginTop: 10,
      alignItems: 'left',
    },
    savingtextStyle: {
      flexDirection: 'row', // Ensures the items are displayed side by side
      alignItems: 'center', // Vertically aligns the items
      gap: 5, // Adds 5px spacing between items (React Native 0.71+)
    },
    savingsAmount: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    savingsDescription: {
      color: 'gray',
      zIndex: 101,
    },
    graphStyle: {
      marginTop: -60,
      
    },
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
      //fontWeight: "bold",
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
    todayContainers: {
      //flexDirection: "row",
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
    navBarContainer: {
      position: "absolute",
      justifyContent: 'space-around',
      alignItems: 'center',
      bottom: 0,
      backgroundColor: "transparent",
    },
    navBar: {
      //backgroundColor: "#ffffff",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      height: 70,
      bottom: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: "relative",
    },
    iconContainer: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
    },
    icon: {
      width: 35,
      height: 35,
      resizeMode: "contain",
      tintColor: "#888888", // Default icon color
    },
    cameraButtonContainer: {
      position: "absolute",
      top: -50, // To elevate above the navigation bar
    },
    cameraIcon: {
      width: 90,
      height: 90,
      resizeMode: "contain",
      tintColor: "#FFA726", // White color for the camera icon
    },


    expensescontainer: {
      marginTop: 20,
      marginBottom: 100, 
    },
  });