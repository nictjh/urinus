import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


function HomePage({navigation}) {
  return (
    <View style = {styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 1.294916,
          longitude: 103.773873,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0121,
        }}
      >
        <Marker
          coordinate={{ latitude: 1.294916, longitude: 103.773873 }}
          title={"NUS SoC"}
          description={"National University of Singapore, School of Computing"}
        />
      </MapView>
      <View style={styles.buttonContainer}>
        <Button 
          title="Update" 
          onPress={() => navigation.navigate('Update')}
          color="white" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: '30%',
    backgroundColor: '#007BFF',
  },
});

export default HomePage;