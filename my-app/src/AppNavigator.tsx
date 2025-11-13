import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import PersonalizeScreen from './components/PersonalizeScreen';
import HistoryScreen from './components/HistoryScreen';
import SpendingScreen from './components/SpendingScreen';
import HomeScreen from './components/HomeScreen';
import SendMoneyScreen from './components/SendMoneyScreen';

export type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Personalize: undefined;
    History: undefined;
    Spending: undefined;
    Home: undefined;
    SendMoney: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Personalize" component={PersonalizeScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Spending" component={SpendingScreen} />
        </Stack.Navigator>
    );
}
