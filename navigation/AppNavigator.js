import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginPage from '../screens/LoginPage.js';
import HomePage from '../screens/UpdatePage.js';
import SignupPage from '../screens/SignupPage.js';
import UpdatePage from '../screens/UpdatePage.js';



const stack = createNativeStackNavigator()

function AppNavigator() {
    return (
        
        <stack.Navigator>
            <stack.Screen name = "Login" component = {LoginPage} />
            <stack.Screen name = "Signup" component = {SignupPage} />
            <stack.Screen name = "Home" component = {HomePage} />
            <stack.Screen name = "Update" component = {UpdatePage} />
        </stack.Navigator>

    );
}

//Always need to export function
export default AppNavigator;