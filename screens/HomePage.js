import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Alert, Image } from 'react-native';
//import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import MapView from '../map/mymap';
import Marker from '../map/mymapMar';
import * as Location from 'expo-location';

function HomePage({ navigation }) {

  const { session } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapRef = useRef(null);

  // for debugging purposes
  const [errorMsg, setErrorMsg] = useState(null);

  // we have to request location permissions lesgoooo
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();
    fetchMarkers()
  }, []);

  const centerMapOnUserLocation = async () => {

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    mapRef.current?.animateToRegion(newRegion, 500); // ya boi is forcing a map animation here
  };

  // async function getProfile() {
  //   try{
  //     const { data, error, status } = await supabase
  //       .from('profiles')
  //       .select(`username`)
  //       .eq('id', session?.user.id)
  //       .single()
  //     if (error && status !== 406) {
  //       throw error;
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       Alert.alert('Error', error.message);
  //     }
  //   }
  // }

  const fetchMarkers = async () => {
    const { data, error } = await supabase
      .from('venues')
      .select('*');
    if (error) {
      console.log('Error fetching markers:', error);
    } else {
      setMarkers(data);
    }
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedMarker(null); // Reset selected marker when modal closes
  };

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={{
          latitude: 1.294826,
          longitude: 103.773999,
          latitudeDelta: 0.0001,
          longitudeDelta: 0.0001,
        }}
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsCompass
      >
        {markers.map((marker) => (
          <Marker
            key={marker.marker_id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            description={marker.roomcode}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={centerMapOnUserLocation}>
        <Image
          source={require('../assets/userlocationbutton.png')}
          style={styles.buttonImage}
        />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedMarker && (
              <>
                <Text>{selectedMarker.roomname || 'No room name available'}</Text>
                <Text>{selectedMarker.roomcode}</Text>
                <Button title="Close" onPress={handleModalClose} />
              </>
            )}
          </View>
        </View>
      </Modal>
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
    width: '100%',
    height: '100%',
  },
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: '30%',
    backgroundColor: '#007BFF',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
});

export default HomePage;