import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const FloatingActionButton = ({ navigation, toggleDrawer }) => {
  const handleNavigation = (screen) => {
    toggleDrawer(); // Close drawer
    navigation.navigate(screen);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddIncome")}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 80,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF", // Blue color matching the image
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default FloatingActionButton;
