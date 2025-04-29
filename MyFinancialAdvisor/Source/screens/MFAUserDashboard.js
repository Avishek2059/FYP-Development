import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Using Expo icons for simplicity
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DashboardSecondComp from "../components/DashboardSecondComp";
import IncomeExpCard from "../components/IncomeExpCard";
import TodayComp from "../components/TodayComp";
import ExpensesGraph from "../components/ExpensesGraph";
import CategoryExpenses from "../components/CategoryExpenses";
import FloatingActionButton from "../components/FloatingActionButton";
//import { useFocusEffect } from "@react-navigation/native";

import WeeklyStats from "../components/WeeklyStats";
import getLocalIP from "../../config";

import { useFocusEffect } from "@react-navigation/native";

import DrawerContent from "./DrawerContent";

let API_URL = "";
let localIPS = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  localIPS = localIP;
  API_URL = `${localIP}/budgetAlert`; // Set the global variable
  //console.log("API URL Set:", localIPS);
};

// Call the function once to set the API URL
setupAPI();

const screenWidth = Dimensions.get("window").width;

export default function MFAUserDashboard({ navigation }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  const handleDrawerPress = (e) => {
    // Prevent the event from bubbling up to the overlay
    e.stopPropagation();
  };

  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    profileImage: "",
  });
  //console.log(userData.profileImage)
  // Function to get user data from AsyncStorage
  const getUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userSession");
      if (storedData !== null) {
        // Parse the JSON string back to an object
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };

  // Reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getUserData(); // Fetch the latest user data when the screen is focused
    }, [])
  );

  const fullName = userData.fullName; // Destructure fullName from userData

  const getFirstName = (fullName) => {
    return fullName.split(" ")[0]; // Get first name
  };

  const firstName = getFirstName(fullName); // Extract first name
  //const username = userData.username; // Destructure username from userData

 
  const [alerts, setAlerts] = useState([]);
  const [dismissedCategories, setDismissedCategories] = useState(new Set());

  // Function to fetch alerts from the backend
  const fetchAlerts = async () => {
    try {
      const formData = new FormData();
      formData.append('username', userData.username); // Replace with actual username from auth
      console.log("Fetching alerts for username:", userData.username);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json(); // Parse JSON

      if (data.status === 'success') {
        setAlerts(data.data);
        setDismissedCategories(new Set()); // Reset dismissed categories on fetch
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch budget alerts');
        console.error('Error fetching alerts:', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch budget alerts: ' + error.message);
      console.error('Error fetching alerts:', error);
    }
  };

  // Fetch alerts on component mount (simulating login)
  useEffect(() => {
    if (userData?.username) {
      fetchAlerts();
    }
  }, [userData]);


  // Show alerts one by one as native Alert pop-ups
  useEffect(() => {
    if (alerts.length > 0) {
      const nextAlert = alerts.find((alert) => !dismissedCategories.has(alert.category));
      if (nextAlert) {
        Alert.alert(
          'Budget Alert',
          nextAlert.alert,
          [
            {
              text: 'OK',
              onPress: () => {
                setDismissedCategories((prev) => new Set(prev).add(nextAlert.category));
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  }, [alerts, dismissedCategories]);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Profile Image on the Left */}
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Image
            source={{
              uri: userData.profileImage
                ? `${localIPS}${userData.profileImage}`
                : `${localIPS}/uploads/profile_images/Avishek Chaudhary.JPG`,
            }}
            //source={require("../assets/Avishek Chaudhary.jpg")}
            style={styles.profileImage}
            onError={(error) =>
              console.log("Image load error:", error.nativeEvent.error)
            }
          />
        </TouchableOpacity>
        <Text style={[styles.usertitle, { fontSize: 24 }]}>{firstName}</Text>

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
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialIcons name="menu" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Drawer */}
      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleDrawer}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleDrawer} // Closes drawer when clicking outside
        >
          <View
            style={styles.drawerContainer}
            onStartShouldSetResponder={() => true} // Enable responder
            onResponderGrant={handleDrawerPress} // Stop propagation
          >
            <DrawerContent
              navigation={navigation}
              toggleDrawer={() => setIsDrawerOpen(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false} // Hides the vertical scroll bar
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Monthly Savings */}

        <DashboardSecondComp />

        {/* Income and Expenditure Cards */}

        <IncomeExpCard />

        {/* Today's Stats */}

        <TodayComp />

        {/* Expenditure Figures */}

        <ExpensesGraph />

        {/* Weekely Stats Figures */}

        <WeeklyStats />

        <CategoryExpenses />
      </ScrollView>

      <FloatingActionButton
        navigation={navigation}
        toggleDrawer={() => setIsDrawerOpen(false)}
      />

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
              C${screenWidth / 2 - 40},10 ${screenWidth / 2 - 5},95 ${
              screenWidth / 2 + 50
            },0
              H${screenWidth / 2 + 60}
              C${screenWidth / 2 + 40},-10 ${
              screenWidth / 2 + 5
            },-95 ${screenWidth},0
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
          <TouchableOpacity
            style={[styles.iconContainer, { marginRight: 60 }]}
            onPress={() => navigation.navigate("Prediction")}
          >
            <Image
              source={require("../assets/prediction.png")} // Replace with your icon path
              style={[styles.icon, { width: 23 }]}
            />
          </TouchableOpacity>

          {/* Barcode Icon */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("SqlQuery")}
          >
            <Image
              source={require("../assets/query.png")} // Replace with your icon path
              style={[styles.icon, { width: 50 }]}
            />
          </TouchableOpacity>

          {/* Profile Icon */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => navigation.navigate("ExpensesDetails")}
          >
            <Image
              source={require("../assets/receipts.png")} // Replace with your icon path
              style={[styles.icon, { width: 23 }]}
            />
          </TouchableOpacity>
        </View>

        {/* Elevated Camera Button */}
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => navigation.navigate("AddExpensesAndIncomesScreen")}
          >
            <Image
              source={require("../assets/camera.png")} // Replace with your camera icon path
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 20,
    height: 60,
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
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  navBarContainer: {
    position: "absolute",
    justifyContent: "space-around",
    alignItems: "center",
    bottom: 0,
    backgroundColor: "transparent",
  },
  navBar: {
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
  usertitle: {
    fontWeight: "bold",
    paddingLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  drawerContainer: {
    width: 320,
    height: "100%",
    backgroundColor: "#fff",
  },
});
