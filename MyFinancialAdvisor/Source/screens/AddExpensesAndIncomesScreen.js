import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import TextRecognition from '@react-native-ml-kit/text-recognition';

const AddExpensesAndIncomesScreen = ({ navigation, route }) => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState(null);
  const [modeVisible, setModeVisible] = useState(false);

  const handelOpenImagePicker = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      //save the image
      await saveImage(result.assets[0].uri);
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
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to open camera: ", error);
      setModeVisible(false);
    }
  };

  const saveImage = async (image) => {
    try {
      setImage(image);
      setModeVisible(false);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
     (async () => {
      if (image) { // Check if the image exists
        try {console.log(image);
          const result = await TextRecognition.recognize(image); // Recognize text from the image
          console.log("Recognized text: ", result.text);
          setText(result.text); // Update the recognized text
        } catch (error) {
          console.error("Text recognition failed: ", error);
        }
      }
    })();
  
  }, [image]); // Dependency array to re-run effect when `image` changes

  return (
    // <View style={styles.container}>
    //   <ScrollView>
    //     <Text style={styles.header}>Add Expenses and Incomes</Text>
    //     <Button title="Pick an Image" onPress={handelOpenImagePicker} />
    //     <Button title="Open Camera" onPress={handleOpenCamera} />
    //      <Image
    //      source={{ uri: image }}
    //      style={styles.image}
    //      />

    //     {text ? (
    //       <ScrollView style={styles.textContainer}>
    //         <Text>{text}</Text>
    //       </ScrollView>
    //     ) : (
    //       <Text style={styles.placeholder}>No text recognized yet.</Text>
    //     )}
    //   </ScrollView>
    // </View>

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
        {image ? ( // Check if the image URI exists
              
                  <View style={styles.ImageBox}>
                    <Image source={{ uri: image }} style={styles.image} /> 
                  </View>
                  

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
  // textContainer: {
  //   marginTop: 20,
  //   padding: 10,
  //   backgroundColor: "#f9f9f9",
  //   borderRadius: 10,
  // },
  Imagecontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  ImageBox: {
    width: "100%",
    height: 700,
  },
  image: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
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
});

export default AddExpensesAndIncomesScreen;
