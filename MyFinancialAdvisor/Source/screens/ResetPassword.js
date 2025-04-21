import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import getLocalIP from "../../config";
//import AsyncStorage from "@react-native-async-storage/async-storage";

let API_URL = "";
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/Resetpassword`;
};
setupAPI();

export default function ResetPassword({navigation}) {
 const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(null);

 
   const validatePassword = (newPassword) => {
     const passwordRegex =
       /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
 
     if (!passwordRegex.test(newPassword)) {
       setError(
         "Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character."
       );
       return false;
     }
 
     return true;
   };
 
   const updatePassword = async () => {
     if (!newPassword || !confirmPassword) {
       setError("Please fill in both password fields");
       return;
     }
 
     if (newPassword !== confirmPassword) {
       setError("Passwords do not match");
       return;
     }
 
     if (!validatePassword(newPassword)) {
         return;
       }
 
     setLoading(true);
     setError(null);
     setSuccess(null);
 
     const formData = new FormData();
     formData.append("new_password", newPassword);
 
     try {
       const response = await fetch(API_URL, {
         method: "POST",
         body: formData,
       });
 
       if (!response.ok) {
         const data = await response.json();
         throw new Error(data.message || "Failed to Reset password");
       }
 
       const data = await response.json();
       setSuccess(data.message);
       setTimeout(() => navigation.navigate("MFALoginScreen"), 2000); // Go back after 2 seconds
     } catch (error) {
       console.error("Reset Password Error:", error);
       setError(error.message);
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <View style={styles.container}>
       <View style={styles.headerContainer}>
         <TouchableOpacity
           style={styles.backButton}
           onPress={() => navigation.goBack()}
         >
           <Image
             source={require("../assets/arrow_back.png")}
             style={styles.backButtonImage}
           />
         </TouchableOpacity>
         <Text style={styles.header}>Reset Password</Text>
       </View>
 
       <ScrollView contentContainerStyle={styles.scrollContainer}>
         <Text style={styles.heading}>Reset Password</Text>
         <Text style={styles.subheading}>Create your new password</Text>
 
         <TextInput
           style={styles.input}
           placeholder="New Password"
           value={newPassword}
           onChangeText={setNewPassword}
           secureTextEntry
         />
 
         <TextInput
           style={styles.input}
           placeholder="Confirm New Password"
           value={confirmPassword}
           onChangeText={setConfirmPassword}
           secureTextEntry
         />
 
         <TouchableOpacity
           style={[styles.button, loading && styles.buttonDisabled]}
           onPress={updatePassword}
           disabled={loading}
         >
           <Text style={styles.buttonText}>
             {loading ? "Updating..." : "Update Password"}
           </Text>
         </TouchableOpacity>
 
         {success && <Text style={styles.successText}>{success}</Text>}
         {error && <Text style={styles.errorText}>{error}</Text>}
       </ScrollView>
     </View>
   );
 }
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
     padding: "8%",
     width: "100%",
   },
   headerContainer: {
     position: "absolute",
     top: 50,
     flexDirection: "row",
     alignItems: "center",
     justifyContent: "center",
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
     flex: 1,
   },
   heading: {
     fontSize: 24,
     fontWeight: "bold",
     textAlign: "center",
     marginBottom: 5,
     marginTop: "35%",
   },
   subheading: {
     textAlign: "center",
     fontSize: 16,
     color: "#555",
     marginBottom: 25,
   },
   input: {
     borderWidth: 1,
     borderColor: "#555",
     borderRadius: 8,
     padding: 10,
     fontSize: 16,
     marginBottom: 20,
     paddingVertical: 14,
     height: 55,
   },
   button: {
     width: "60%",
     backgroundColor: "#7A5BD0",
     paddingVertical: 14,
     borderRadius: 8,
     alignItems: "center",
     alignSelf: "center",
     marginBottom: 20,
   },
   buttonDisabled: {
     backgroundColor: "#A0A0A0",
   },
   buttonText: {
     color: "#fff",
     fontSize: 16,
     fontWeight: "bold",
   },
   successText: {
     color: "green",
     fontSize: 16,
     textAlign: "center",
     marginTop: 10,
   },
   errorText: {
     color: "red",
     fontSize: 16,
     textAlign: "center",
     marginTop: 10,
   },
 });