import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../screens/LoginPage.js';
import HomePage from '../screens/HomePage.js';


const stack = createNativeStackNavigator()

function AppNavigator() {
    return (
        <stack.Navigator>
            <stack.Screen name="Login" component={LoginPage} />
            <stack.Screen name="Home" component={HomePage} />
        </stack.Navigator>
  
    );
}

//Always need to export function
export default AppNavigator;