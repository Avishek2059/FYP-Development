import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { DrawerItem } from "@react-navigation/drawer";

import getLocalIP from "../../config";

let API_URL = "";
let localIPS = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  localIPS = localIP;
  API_URL = `${localIP}/profile`; // Set the global variable
  //console.log("API URL Set:", localIPS);
};

// Call the function once to set the API URL
setupAPI();

const DrawerContent = ({ navigation, toggleDrawer }) => {
  const handleNavigation = (screen) => {
    toggleDrawer(); // Close drawer
    navigation.navigate(screen);
  };

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    username: "",
    profileImage: "",
  });

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
      alert("Error retrieving user data:", error);
      //console.error("Error retrieving user data:", error);
    }
  };

  // Use useEffect to fetch data when component mounts
  // Reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getUserData(); // Fetch the latest user data when the screen is focused
    }, [])
  );

  // Handle Log Out
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userSession");
      // Navigate to the login screen (adjust the route name as per your navigation setup)
      navigation.navigate("MFALoginScreen");
    } catch (error) {
      //console.error("Error during logout:", error);
    }
  };

  const helpSupport = async () => {
    try {
      Alert.alert(
        "Help & Support",
        "If you need any assistance, feel free to reach out to us at 9817112305."
      );
    } catch (error) {
      //console.error("Error during sending Alert:", error);
    }
  };

  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showLogInfo, setshowLogInfo] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  return (
    <View style={styles.drawerContent}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: userData.profileImage
                ? `${localIPS}${userData.profileImage}`
                : `${localIPS}/uploads/profile_images/Avishek Chaudhary.JPG`,
            }}
            style={styles.profileImage}
            onError={(error) =>
              console.log("Image load error:", error.nativeEvent.error)
            }
          />
          <View style={styles.cameraIconContainer}>
            <Icon name="camera" size={10} color="#fff" />
          </View>
        </View>
        <View>
          <Text style={styles.name}>{userData.fullName}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      </View>
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <DrawerItem
          label="Account Information"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="account-outline" size={size} color="#000" />
          )}
          onPress={() => {
            setShowUserInfo(!showUserInfo);
            setshowLogInfo(false);
            setShowLanguage(false);
          }} // Toggle user info visibility
        />

        {/* Conditionally render user information */}
        {showUserInfo && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Name: {userData.fullName}</Text>
            <Text style={styles.userInfoText}>
              Username: {userData.username}
            </Text>
            <Text style={styles.userInfoText}>Email: {userData.email}</Text>
            <Text style={styles.userInfoText}>Phone: {userData.phone}</Text>
          </View>
        )}
        <DrawerItem
          label="Login and Security"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="account-cog-outline" size={size} color="#000" />
          )}
          onPress={() => {
            setshowLogInfo(!showLogInfo);
            setShowUserInfo(false);
            setShowLanguage(false);
          }}
        />

        {showLogInfo && (
          <View style={styles.userInfoContainer}>
            <DrawerItem
              label="Change Password"
              labelStyle={styles.menuLabel}
              icon={({ size }) => (
                <Icon name="lock-reset" size={size} color="#000" />
              )}
              onPress={() => handleNavigation("ChangePassword")}
            />
            <DrawerItem
              label="Delete Account"
              labelStyle={[styles.menuLabel, styles.deleteLabel]}
              icon={({ size }) => (
                <Icon name="account-remove-outline" size={size} color="red" />
              )}
              onPress={() => handleNavigation("DeleteAccount")}
            />
          </View>
        )}

        <DrawerItem
          label="Language"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="web" size={size} color="#000" />
          )}
          onPress={() => {
            setShowLanguage(!showLanguage);
            setshowLogInfo(false);
            setShowUserInfo(false);
          }}
        />

        {showLanguage && (
          <View style={styles.userInfoContainer}>
            <TouchableOpacity
              style={styles.backButton}
              //onPress={() => navigation.goBack()}
            >
              <Text style={styles.userInfoText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              //onPress={() => navigation.goBack()}
            >
              <Text style={styles.userInfoText}>Nepali</Text>
            </TouchableOpacity>
          </View>
        )}
        <DrawerItem
          label="Location"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="map-marker-outline" size={size} color="#000" />
          )}
          onPress={() => navigation.navigate("Location")}
        />
        <DrawerItem
          label="Predict"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="chart-line" size={size} color="#000" />
          )}
          onPress={() => handleNavigation("Prediction")}
        />
        <DrawerItem
          label="Query"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="message-question-outline" size={size} color="#000" />
          )}
          onPress={() => handleNavigation("SqlQuery")}
        />
        <DrawerItem
          label="Add Expenses"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="wallet-outline" size={size} color="#000" />
          )}
          onPress={() => handleNavigation("AddExpensesAndIncomesScreen")}
        />
        <DrawerItem
          label="Add Income"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="cash-plus" size={size} color="#000" />
          )}
          onPress={() => handleNavigation("AddIncome")}
        />
        <DrawerItem
          label="Recommendation"
          labelStyle={styles.menuLabel}
          icon={({ color, size }) => (
            <Icon name="lightbulb-outline" size={size} color="#000" />
          )}
          onPress={() => navigation.navigate("Recommendation")}
        />
        <DrawerItem
          label="Help & Support"
          labelStyle={styles.menuLabel}
          icon={({ size }) => (
            <Icon name="help-circle-outline" size={size} color="#000" />
          )}
          onPress={helpSupport}
        />
        <DrawerItem
          label="Log Out"
          labelStyle={[styles.menuLabel, styles.logoutLabel]}
          icon={({ color, size }) => (
            <Icon name="logout" size={size} color="#FF0000" />
          )}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profileContainer: {
    flexDirection: "row",
    //marginTop: 80,
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 60,
    backgroundColor: "#666",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    borderRadius: 15,
    padding: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 13,
    color: "#666",
  },
  menuContainer: {
    marginTop: 10,
    marginLeft: -15,
  },
  menuLabel: {
    fontSize: 16,
    color: "#000",
  },
  logoutLabel: {
    color: "#FF0000",
  },
  userInfoContainer: {
    //paddingLeft: 15,
    backgroundColor: "#f5f5f5", // Light background like in the image
    marginHorizontal: 5,
    borderRadius: 5,
    padding: 15,
  },
  userInfoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
  },
  
});

export default DrawerContent;
