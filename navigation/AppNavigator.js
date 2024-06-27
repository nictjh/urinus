import * as React from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginPage from '../screens/LoginPage';
import SignupPage from '../screens/SignupPage';
import UpdatePage from '../screens/UpdatePage';
import HomePage from '../screens/HomePage';
import ReviewPage from '../screens/ReviewPage';
import DetailsScreen from '../screens/DetailsScreen';
import CardsPage from '../screens/CardsPage';
const homeIcon = require('../assets/navigation.png');
const rateIcon = require('../assets/brand-twitter.png');
const profileIcon = require('../assets/user-circle.png');
const cardsIcon = require('../assets/article.png');
import { useAuth } from '../screens/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppNavigator() {

    return (
        // Version 1 (Where login is always required)
        // <Stack.Navigator>
        //     <Stack.Screen name="Login" component={LoginPage} />
        //     <Stack.Screen name="Signup" component={SignupPage} />
        //     <Stack.Screen name="TabHome" component={TabNavigator} options={{ headerShown: false }} />
        // </Stack.Navigator>

        // Version 2
        <Stack.Navigator>
            <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        </Stack.Navigator>

    );
}

// const AuthRequiredScreen = ({ component: Component }) => {
//     const { session } = useAuth();
//     const navigation = useNavigation();

//     React.useEffect(() => {
//         if (!session) {
//             navigation.navigate('Auth', { screen: 'Login' });
//         }
//     }, [session, navigation]);

//     return session ? <Component /> : null;
// };

const AuthStack = () => {
    // This is for the login page stack
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Signup" component={SignupPage} />
        </Stack.Navigator>
    );
};

const HomeStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Map" component={HomePage} options={{ headerShown: false }}/>
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Toilet Information' }} />
      </Stack.Navigator>
    );
  };

const TabNavigator = () => {

    const { session } = useAuth();
    const navigation = useNavigation();

    const handlePress = (targetScreen) => {
        if (!session) {
            Alert.alert(
                "Access Restricted",
                "You must be logged in to access this page.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => navigation.navigate('Auth', { screen: 'Login' }) }
                ]
            );
        } else {
            navigation.navigate(targetScreen);
        }
    };

    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeStack} options={{
                title: 'Explore',
                tabBarIcon: ({ focused }) => (
                    <Image source={homeIcon} style={{ height: 30, width: 30, tintColor: focused ? "#000000" : "#999999" }} />
                ),
            }} />

            <Tab.Screen name="ReviewCards" component={CardsPage} options={{
                title: 'Updates',
                tabBarIcon: ({ focused }) => (
                    <Image source={cardsIcon} style={{ height: 30, width: 30, tintColor: focused ? "#000000" : "#999999" }} />
                ),
            }} />

            <Tab.Screen name="Review" component={ReviewPage} options={{
                title: 'Submit',
                tabBarIcon: ({ focused }) => (
                    <Image source={rateIcon} style={{ height: 30, width: 30, tintColor: focused ? "#000000" : "#999999" }} />
                ),
            }} />

            <Tab.Screen name="Profile" component={UpdatePage} options={{
                title: 'Profile',
                tabBarIcon: ({ focused }) => (
                    <Image source={profileIcon} style={{ height: 30, width: 30, tintColor: focused ? "#000000" : "#999999" }} />
                ),
                tabBarButton: (props) => session ? (
                    <TouchableOpacity {...props} />
                ) : (
                    <TouchableOpacity {...props} onPress={() => handlePress("Profile")} />
                )
            }} />
        </Tab.Navigator>
    );
}

export default AppNavigator;
