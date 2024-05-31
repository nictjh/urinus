import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

function HomePage({navigation}) {
  return (
    <View style = {styles.container}>
      <Text>Home</Text>
      <Button title = "Logout" onPress={() => navigation.navigate('Login')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomePage;
