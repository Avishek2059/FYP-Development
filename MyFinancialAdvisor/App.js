import React from 'react';
import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
//import com.BV.LinearGradient.LinearGradientPackage;
import { theme } from './Source/core/theme'
import {
  StartScreen,
  SecondStartScreen,
  ThirdStartScreen,
  MyFinancialAdvisorAccount,
  MFALoginScreen,
  MFACreateAccount,
  ResetPasswordScreen,
  Dashboard,
} from './Source/screens'

const Stack = createStackNavigator()

export default function App() {
  return (
    <Provider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="SecondStartScreen" component={SecondStartScreen} />
          <Stack.Screen name="ThirdStartScreen" component={ThirdStartScreen} />
          <Stack.Screen name="MyFinancialAdvisorAccount" component={MyFinancialAdvisorAccount} />
          <Stack.Screen name="MFALoginScreen" component={MFALoginScreen} />
          <Stack.Screen name="MFACreateAccount" component={ MFACreateAccount} />
          {/* <Stack.Screen name="Dashboard" component={Dashboard} /> */}
          {/* <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}