import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useCallback } from "react";
import { DrawerItem } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

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

// Placeholder for profile image (you can replace with a real image URI)
//const profileImage = "https://via.placeholder.com/100";

export default function Profile({ navigation }) {
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
      console.error("Error retrieving user data:", error);
    }
  };

  // Use useEffect to fetch data when component mounts
  // Reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      getUserData(); // Fetch the latest user data when the screen is focused
    }, [])
  );

  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

  // Handle Log Out
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userSession");
      // Navigate to the login screen (adjust the route name as per your navigation setup)
      navigation.navigate("MFALoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const [profileData, setProfileData] = useState({
    total_invoices: 0,
    total_savings: 0,
  });

  // Function to fetch profile data (total invoices and savings)
  const fetchProfileData = async () => {
    if (!userData.username || !API_URL) {
      console.log("Waiting for username or API_URL:", {
        username: userData.username,
        API_URL,
      });
      return;
    }
    console.log("Fetching profile data for username:", userData.username);

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("username", userData.username);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      const text = await response.text();
      //console.log("Raw Response:", text);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text || "Failed to fetch profile data");
        }
        throw new Error(errorData.error || "Failed to fetch profile data");
      }

      const data = JSON.parse(text);
      //console.log("Parsed Data:", data);

      if (data.status === "success") {
        setProfileData({
          total_invoices: data.data.total_invoices,
          total_savings: data.data.total_savings,
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

  // Fetch profile data when username is available
  useEffect(() => {
    if (userData.username) {
      fetchProfileData();
    }
  }, [userData.username]);

  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showLogInfo, setshowLogInfo] = useState(false);

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

        <Text style={styles.header}>Expenses</Text>

        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <Icon
            style={styles.editButton}
            name="account-edit"
            size={28}
            color="balck"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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
              <Icon name="camera" size={20} color="#fff" />
            </View>
          </View>
          <Text style={styles.name}>{userData.fullName}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        {/* Data Section */}
        <View style={styles.DataContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <View style={styles.dataItem}>
                <Text style={styles.dataValue}>
                  {profileData.total_invoices}
                </Text>
                <Text style={styles.dataLabel}>No. of Invoices</Text>
              </View>
              <View style={styles.dataItem}>
                <Text
                  style={[
                    styles.dataValue,
                    profileData.total_savings < 0 && styles.negativeValue,
                  ]}
                >
                  ₹{Math.abs(profileData.total_savings).toFixed(2)}
                </Text>
                <Text style={styles.dataLabel}>
                  {profileData.total_savings >= 0 ? "Savings" : "Loss"}
                </Text>
              </View>
            </>
          )}
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
                onPress={() => navigation.navigate("ChangePassword")}
              />
              <DrawerItem
                label="Delete Account"
                labelStyle={[styles.menuLabel, styles.deleteLabel]}
                icon={({ size }) => (
                  <Icon name="account-remove-outline" size={size} color="red" />
                )}
                onPress={() => navigation.navigate("DeleteAccount")}
              />
            </View>
          )}
          <DrawerItem
            label="Log Out"
            labelStyle={[styles.menuLabel, styles.logoutLabel]}
            icon={({ color, size }) => (
              <Icon name="logout" size={size} color="#FF0000" />
            )}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "absolute",
    top: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
    flex: 1, //
    //marginLeft:-70,
  },
  profileContainer: {
    marginTop: 80,
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  editButton: {
    marginRight: 20,
  },
  menuContainer: {
    marginTop: 10,
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
  DataContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    justifyContent: "space-around",
  },
  dataItem: {
    alignItems: "center",
  },
  dataValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#62C498",
  },
  negativeValue: {
    color: "#FF0000", // Red color for negative savings (loss)
  },
  dataLabel: {
    fontSize: 16,
    color: "#666",
  },
  loadingText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    flex: 1,
  },
});
