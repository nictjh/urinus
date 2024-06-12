import * as React from 'react';
import { Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginPage from '../screens/LoginPage';
import SignupPage from '../screens/SignupPage';
import UpdatePage from '../screens/UpdatePage';
import HomePage from '../screens/HomePage';
import ReviewPage from '../screens/ReviewPage';
const homeIcon = require('../assets/navigation.png');
const rateIcon = require('../assets/brand-twitter.png');
const profileIcon = require('../assets/user-circle.png');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppNavigator() {
    return (
        
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Signup" component={SignupPage} />
            <Stack.Screen name="TabHome" component={TabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
        
    );
}

const TabNavigator = () => {
    return (
        <Tab.Navigator initialRouteName="Home">
            <Tab.Screen 
                name="Home" 
                component={HomePage} 
                options={{
                    title: 'Home', 
                    tabBarIcon: ({ focused }) => (<Image 
                        source={homeIcon} style={{height:30, width:30, tintColor: focused ? "#000000" : "#999999"}} 
                        />)
                }} 
            />
            <Tab.Screen 
                name="Review" 
                component={ReviewPage} 
                options={{
                    title: 'Review', 
                    tabBarIcon: ({ focused }) => (<Image 
                        source={rateIcon} style={{height:30, width:30, tintColor: focused ? "#000000" : "#999999"}} 
                        />)
                }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={UpdatePage} 
                options={{
                    title: 'Update', 
                    tabBarIcon: ({ focused }) => (<Image 
                        source={profileIcon} style={{height:30, width:30, tintColor: focused ? "#000000" : "#999999"}} 
                    />)
                }} 
            />
        </Tab.Navigator>
    );
}

export default AppNavigator;
