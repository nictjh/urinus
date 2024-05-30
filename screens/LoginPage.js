import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';


function LoginPage({navigation}) {
    return (
        <View style = {styles.container}>
            <Text>Login Page</Text>
            <Button title = "Login" onPress = {() => navigation.navigate('Home')}/>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
    },
});

export default LoginPage;