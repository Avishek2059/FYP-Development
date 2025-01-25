import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MFADashboard({ route, navigation }) {
  const { userData } = route.params; // Retrieve the passed data from the route object

  return (
    <View style={{ backgroundColor: '#000', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', marginBottom: 20, fontSize: 30 }}>
        Hi {userData.logged_in_as} 👋
      </Text>
      <Button
        title="Logout"
        color="#9C00E4"
        onPress={async () => {
          await AsyncStorage.removeItem('access_token');
          navigation.replace('MFALoginScreen'); // Replace with the correct screen name
        }}
      />
    </View>
  );
}
