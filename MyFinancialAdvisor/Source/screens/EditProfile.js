import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker"; // Expo Image Picker
//import RNPickerSelect from "react-native-picker-select"; // For dropdown
import getLocalIP from "../../config";

// Define a global variable to store the API URL
let API_URL = "";
let localIPS = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  localIPS= localIP
  API_URL = `${localIP}/updateprofile`;
  //console.log("API URL Set for EditProfile:", API_URL);
};

// Call the function once to set the API URL
setupAPI();


const defaultProfileImage = "/uploads/profile_images/Avishek Chaudhary.JPG";

export default function EditProfile({ navigation }) {
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    profileImage:"",
  });

  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateFullName = (fullName) => {
    const nameRegex = /^[A-Za-z\s]{2,}$/; // Letters and spaces, min 2 characters
    if (!fullName) {
      return "Full name is required";
    } else if (!nameRegex.test(fullName)) {
      return "Full name must contain only letters and spaces, and be at least 2 characters long";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
    if (!email) {
      return "Email is required";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/; // Ensures exactly 10 digits
    if (!phone) {
      return "Phone number is required";
    } else if (!phoneRegex.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  // Validate all fields and update error state
  const validateForm = () => {
    const fullNameError = validateFullName(userData.fullName);
    const emailError = validateEmail(userData.email);
    const phoneError = validatePhone(userData.phone);

    setErrors({
      fullName: fullNameError,
      email: emailError,
      phone: phoneError,
    });

    return !fullNameError && !emailError && !phoneError;
  };

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    username: "",
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
      Alert.alert("Error", "Failed to retrieve user data: " + error.message);
      console.error("Error retrieving user data:", error);
    }
  };

  // Use useEffect to fetch data when component mounts
  useEffect(() => {
    getUserData();
  }, []);

  // Handle image selection with Expo Image Picker
  const handleImagePick = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setUserData({ ...userData, profileImage: uri });
      } else {
        console.log("User cancelled image picker");
      }
    } catch (error) {
      console.error("ImagePicker Error: ", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", userData.username);
      formData.append("fullName", userData.fullName);
      formData.append("email", userData.email);
      formData.append("phone", userData.phone);

      if (userData.profileImage && userData.profileImage.startsWith("file://")) {
        formData.append("profileImage", {
          uri: userData.profileImage,
          type: "image/jpeg",
          name: "profile.jpg",
        });
      }

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const text = await response.text();
      //console.log("Raw Response:", text);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error(text || "Failed to update profile");
        }
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = JSON.parse(text);
      console.log("Parsed Data:", data);

      if (data.status === "success") {
        const { username, fullName, email, phone, profileImage } = data.user; // Extract all user details

          // Store user session in AsyncStorage
          await AsyncStorage.setItem(
            "userSession",
            JSON.stringify({ username, fullName, email, phone, profileImage })
          );
        Alert.alert("Success", "Profile updated successfully");
        navigation.goBack();
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Profile</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for symmetry */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  userData.profileImage && !userData.profileImage.startsWith("file://")
                    ? `${localIPS}${userData.profileImage}` // Server path
                    : userData.profileImage && userData.profileImage.startsWith("file://")
                    ? userData.profileImage // Local URI (for preview before upload)
                    : `${localIPS}${defaultProfileImage}`, // Default image
              }}
              style={styles.profileImage}
              onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
            />
            <TouchableOpacity
              style={styles.cameraIconContainer}
              onPress={handleImagePick}
            >
              <Icon name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Information */}
        <Text style={styles.sectionTitle}>Your Information</Text>

        {/* Full Name */}
        <View>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Full name"
            value={userData.fullName}
            onChangeText={(text) => {
              setUserData({ ...userData, fullName: text });
              setErrors({ ...errors, fullName: validateFullName(text) });
            }}
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}
        </View>

        {/* Phone */}
        <View>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Phone (e.g., 9817112305)"
            value={userData.phone}
            onChangeText={(text) => {
              setUserData({ ...userData, phone: text });
              setErrors({ ...errors, phone: validatePhone(text) });
            }}
            keyboardType="phone-pad"
          />
          {errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : null}
        </View>

        {/* Email */}
        <View>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email ID"
            value={userData.email}
            onChangeText={(text) => {
              setUserData({ ...userData, email: text });
              setErrors({ ...errors, email: validateEmail(text) });
            }}
            keyboardType="email-address"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={
            loading || Object.values(errors).some((error) => error !== "")
          }
        >
          <Text style={styles.updateButtonText}>
            {loading ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>
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
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: "#E0E0E0",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  scrollContainer: {
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -10,
  },
  updateButton: {
    backgroundColor: "#00CC44",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    color: "#000",
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    color: "#000",
  },
});
