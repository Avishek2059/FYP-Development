import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  } from "react-native";
import * as ImagePicker from "expo-image-picker";
import getLocalIP from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { set } from "react-hook-form";


// Define a global variable to store the API URL
let API_URL = "";
let API_URL2 = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/expensesincomeimage`; // Set the global variable
  API_URL2 = `${localIP}/getanswer`; // Set the global variable
  //console.log("API URL Set:", API_URL);
};

// Call the function once to set the API URL
setupAPI();

const AddExpensesAndIncomesScreen = ({ navigation}) => {
  const [imageUri, setImageUri] = useState(null);
  const [text, setText] = useState(null);
  const [modeVisible, setModeVisible] = useState(false);
  const [image, setImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadData, setUploadData] = useState(null);
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
        // Parse the JSON string back to an object
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      }
    } catch (error) {
      alert('Error retrieving user data: ', error);
      console.error('Error retrieving user data:', error);
    }
  };

  // Use useEffect to fetch data when component mounts
  useEffect(() => {
    getUserData();
  }, []);

  //console.log(userData.username);
  

  const handelOpenImagePicker = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    //console.log(result);

    if (!result.canceled) {
      //save the image
      await saveImageUri(result.assets[0].uri);
      await saveImage(result.assets[0]);
    }
  };

  const handleOpenCamera = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        quality: 1,
      });
      if (!result.cancelled) {
        //save the image
        await saveImageUri(result.assets[0].uri);
        await saveImage(result.assets[0]);
      }
    } catch (error) {
      alert('Failed to open camera');
      console.error("Failed to open camera: ", error);
      setModeVisible(false);
    }
  };

  const saveImageUri = async (image) => {
    try {
      setImageUri(image);
      setModeVisible(false);
    } catch (error) {
      throw error;
    }
  };

  const saveImage = async (image) => {
    try {
      setImage(image);
    } catch (error) {
      throw error;
    }
  };

  const handelImageSubmit = async () => {
    //console.log(image);
    setIsSubmitting(true);
    setError(null);
    setUploadData(null);
    setShowQuestionInput(false);
    setuploadanswer(null);

    if (!image) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      name: image.fileName || 'upload.jpg',
      type: image.mimetype || 'image/jpeg',
    });
    formData.append('username', userData.username);

    try {
      //console.log(API_URL);
      const response = await fetch(API_URL, {
          method: 'POST',
          body:formData,
          headers: {},
       });

      if (!response.ok) {
        const data = await response.json();
        //console.log('Upload Error:', data);
        //setError(data);
        //setIsSubmitting(false);
        throw new Error(`${data.message}`);
        
      }
       const data = await response.json();
       //console.log('Upload Response:', data);
       setUploadData(data.data); // Store the data for display
    }
    catch (error) {
      //console.error('Upload Error:', error);
      setError(error.message);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  //for reqrying invoice
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [isgetting, setisgetting] = useState(false);
  const [uploadanswer, setuploadanswer] = useState(null);

  const handleQuery = () => {
    setUploadData(null);
    setError(null);
    setuploadanswer(null);
    // Show the question input section
    setShowQuestionInput(true);
    
  };

  const handleGetAnswer = async () => {
    setuploadanswer(null);
    if (!question.trim()) return;

    setisgetting(true);
    //console.log(question);

    if (!image) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      name: image.fileName || 'upload.jpg',
      type: image.mimetype || 'image/jpeg',
    });
    formData.append('question', question);
    
    try {
      //console.log(API_URL2);
      const response = await fetch(API_URL2, {
          method: 'POST',
          body:formData,
          headers: {},
       });

       if (!response.ok) {
        const data = await response.json();
        //console.log('Upload Error:', data);
        throw new Error(`${data.message}`);
        
      }
       const data = await response.json();
       console.log('Upload Response:', data.response);
       setuploadanswer(data.response); // Store the data for display
    }
    catch (error) {
      //console.error('Upload Error:', error);
      setError(error.message);
    }
    finally {
      setisgetting(false);
    }
  };

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

        <Text style={styles.header}>Add Expenses & Incomes</Text>
      </View>

      <View style={styles.Imagecontainer}>
        {imageUri ? ( // Check if the image URI exists
                  <ScrollView style={styles.ScrollStyle}>
                  <View>
                    <View style={styles.ImageBox}>
                    <Image source={{ uri: imageUri }} style={styles.image} /> 
                    </View>

                    <View style={styles.ImageProcessBtns}>
                       <TouchableOpacity
                        style={styles.ImageProcessBtn}
                        onPress={handleQuery}
                      >
                        <Text style={styles.panelButtonTitle}>Ask</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.ImageProcessBtn}
                        onPress={handelImageSubmit}
                        disabled={isSubmitting} // Optional: disables button while submitting
                      >
                        <Text style={styles.panelButtonTitle}>
                          {isSubmitting ? 'Submitting' : 'Submit'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Question input section - shown when Ask is pressed */}
                    {showQuestionInput && (
                      <View style={styles.questionContainer}>
                        <Text style={styles.questionTitle}>
                          Ask any information from the uploaded invoice
                        </Text>
                        <TextInput
                          style={styles.input}
                          value={question}
                          onChangeText={setQuestion}
                          placeholder="Enter your question"
                          multiline
                        />
                        <TouchableOpacity
                          style={styles.getAnswerBtn}
                          onPress={handleGetAnswer}
                          disabled={isgetting || !question.trim()}
                        >
                          <Text style={styles.panelButtonTitle}>
                            {isgetting ? 'Getting Answer...' : 'Get Answer'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Display success message and data */}
                    {uploadData && (
                      <View style={styles.successContainer}>
                        <Text style={styles.successText}>Image data stored successfully!</Text>
                        <View style={styles.dataContainer}>
                        <Text style={styles.dataText}>
                            Issuer: {uploadData.issuer}
                          </Text>
                          <Text style={styles.dataText}>
                            Invoice Number: {uploadData.invoice_number}
                          </Text>
                          <Text style={styles.dataText}>
                            Invoice Date: {uploadData.invoice_date}
                          </Text>
                          <Text style={styles.dataText}>
                            Grand Total: ${uploadData.grand_total}
                          </Text>
                          <Text style={styles.dataText}>
                            Expense Category: {uploadData.expense_category}
                          </Text>
                          
                        </View>
                      </View>
                    )}

                    {/* Display error if any */}
                    {error && (
                      <Text style={styles.errorText}>{error}</Text>
                    )}

                    {/* Display error if any */}
                    {uploadanswer && (

                        <View style={styles.successContainer}>
                        <Text style={styles.successText}>Reponse is: </Text>
                        <Text style={styles.responseText}>{uploadanswer}</Text>
                        </View>
                      
                    )}

                  </View>
                  </ScrollView>
                  

        ) : (
          <View style={styles.panel}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.panelTitle}>Upload Invoice</Text>
              <Text style={styles.panelSubtitle}>
                Choose Your Invoice Picture
              </Text>
            </View>
            <TouchableOpacity
              style={styles.panelButton}
              onPress={handleOpenCamera}
            >
              <Text style={styles.panelButtonTitle}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.panelButton}
              onPress={handelOpenImagePicker}
            >
              <Text style={styles.panelButtonTitle}>Choose From Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.panelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.panelButtonTitle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  
  headerContainer: {
    position: "absolute", // Position the container
    top: 50, // At the top of the screen
    flexDirection: "row", // Arrange items in a row
    alignItems: "center", // Center items vertically
    justifyContent: "center", // Center items horizontally within the container
  },
  backButtonImage: {
    width: 70, // Set appropriate width
    height: 24, // Set appropriate height
    resizeMode: "contain", // Ensure image scales properly
    marginLeft: -15, // Adjust spacing from the left
  },
  header: {
    fontSize: 18, // Adjust font size
    fontWeight: "bold", // Make the title bold
    textAlign: "center", // Center text within its own space
    flex: 1, // Take remaining space for proper centering
    //marginLeft: -55,
  },
  Imagecontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  ImageBox: {
    width: "100%",
    height: 650,
  },
  image: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
  },
  ScrollStyle:{
    width: "100%",
    marginTop: 80,

  },
  ImageProcessBtns:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  ImageProcessBtn:{
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#FF6347",
    alignItems: "center",
    width: "35%",
  },
  panel: {
    position: "absolute",
    width: "100%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: -15,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "gray",
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#FF6347",
    alignItems: "center",
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  successContainer: {
    marginTop: 20,
  },
  successText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  dataText: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  responseText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  questionContainer: {
    marginTop: 20,
    padding: 10,
  },
  questionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 60,
  },
  getAnswerBtn: {
    padding: 10,
    backgroundColor: '#FF6347',
    borderRadius: 5,
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
  },
});

export default AddExpensesAndIncomesScreen;
