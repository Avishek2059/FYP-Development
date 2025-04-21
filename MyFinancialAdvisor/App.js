import React from 'react';
import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { theme } from './Source/core/theme'
import {
  StartScreen,
  SecondStartScreen,
  ThirdStartScreen,
  MyFinancialAdvisorAccount,
  MFALoginScreen,
  MFACreateAccount,
  MFAUserDashboard,
  AddExpensesAndIncomesScreen,
  SqlQuery,
  Prediction,
  ExpensesDetails,
  Profile,
  EditProfile,
  AddIncome,
  DeleteAccount,
  ChangePassword,
  UpdatePassword,
  Recommendation,
  ForgetPassword,
  ValidateOTP,
  ResetPassword,
  SetBudget
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
          <Stack.Screen name="MFAUserDashboard" component={MFAUserDashboard} />
          <Stack.Screen name="AddExpensesAndIncomesScreen" component={AddExpensesAndIncomesScreen} />
          <Stack.Screen name="SqlQuery" component={SqlQuery} />
          <Stack.Screen name="Prediction" component={Prediction} />
          <Stack.Screen name="ExpensesDetails" component={ExpensesDetails} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="AddIncome" component={AddIncome} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
          <Stack.Screen name="Recommendation" component={Recommendation} />
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
          <Stack.Screen name="ValidateOTP" component={ValidateOTP} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="SetBudget" component={SetBudget} />
          {/* <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          /> */}
        </Stack.Navigator>  
      </NavigationContainer>
      
    </Provider>
  )
}