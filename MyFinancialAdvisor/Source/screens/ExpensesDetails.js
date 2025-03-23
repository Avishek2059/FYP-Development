import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getLocalIP from "../../config";


// Define a global variable to store the API URL
let API_URL = "";

// Function to set up the API URL
const setupAPI = async () => {
  const localIP = await getLocalIP();
  API_URL = `${localIP}/expenses`; // Set the global variable
  //console.log("API URL Set:", API_URL);
};

// Call the function once to set the API URL
setupAPI();

export default function ExpensesDetails({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Categories for the dropdown
  const categories = [
    { label: "All", value: "all" },
    { label: "Food", value: "food" },
    { label: "Transport", value: "transport" },
    { label: "Entertainment", value: "entertainment" },
    { label: "Housing", value: "housing" },
    { label: "Shopping", value: "shopping" },
    { label: "Healthcare", value: "healthcare" },
    { label: "Debt Payments", value: "debt payments" },
    { label: "Savings/Investments", value: "savings/investments" },
    { label: "Gifts & Donations", value: "gifts & donations" },
    { label: "Miscellaneous", value: "miscellaneous" },
  ];

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
  useEffect(() => {
    getUserData();
  }, []);

  // Function to fetch expenses from the backend
  const handleFetch = async () => {
    if (selectedCategory == "Select Category") {
      alert("Please select a category for prediction!");
      return;
    }
    setLoading(true);
    setExpenses(null); // Clear previous response

    const formData = new FormData();
    formData.append("selectedCategory", selectedCategory);
    formData.append("username", userData.username);
    try {
      //console.log(API_URL);
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (response.ok) {
        const result = await response.json();
        setExpenses(result.expenses);
      } else {
        const data = await response.json();
        console.log("Upload Error:", error);
        throw new Error(`${data.message}`);
      }
    } catch (error) {
      //console.error('Upload Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatInvoiceDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "invoice_date"; // Fallback if invalid
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "invoice_date"; // Fallback if parsing fails
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Render each expense item
  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.placeholderImage} />
      <View style={styles.expenseDetails}>
        <Text style={styles.issuerText}>{item.issuer || "ISSUER"}</Text>
        <Text style={styles.categoryText}>{item.invoice_number || "invoice_number"}</Text>
        <Text style={styles.dateText}>{formatInvoiceDate(item.invoice_date) || "invoice_date"}</Text>
      </View>
      <View>
        <Text style={styles.amountText}>{item.grand_total || "grand_total"}</Text>
        <Text style={styles.categoryText1}>{item.expense_category || "expense_category"}</Text>
      </View>
    </View>
  );

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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Category Dropdown and Fetch Button */}
      <View style={styles.filterRow}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {categories.map((category) => (
              <Picker.Item
                key={category.value}
                label={category.label}
                value={category.value}
              />
            ))}
          </Picker>
        </View>
        <TouchableOpacity 
        style={styles.fetchButton} 
        onPress={handleFetch}
        disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Fetching' : 'Fetch'}
        </Text>
        </TouchableOpacity>
      </View>

      {/* Expenses List */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses found</Text>
        }
      />
      {/* Display error if any */}
        {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    //alignItems: "center",
    padding: '8%',
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
    flex: 1, //
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //paddingHorizontal: 20,
    //paddingVertical: 10,
    marginTop: "20%",
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#555", // Cyan border
    borderRadius: 5,
    width: "48%",
    backgroundColor: "#F5F5F5", // Light gray background
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  fetchButton: {
    backgroundColor: "#6A5ACD", // Purple button color
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  placeholderImage: {
    width: 50,
    height: 50,
    backgroundColor: "#ccc", // Placeholder for the image
    borderRadius: 5,
    marginRight: 15,
  },
  expenseDetails: {
    flex: 1,
  },
  issuerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryText1: {
    fontSize: 14,
    color: "#666",
    alignSelf: "flex-end",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  amountText: {
    alignSelf: "flex-end",
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF0000", // Red color for negative amount
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
