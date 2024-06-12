import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal } from 'react-native';
//import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import MapView from '../map/mymap'
import Marker from '../map/mymapMar';

function HomePage({ navigation }) {

  const { session } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);


  // useEffect(() => {
  //   const initialize = async () => {
  //     if (session?.user) {
  //       await getProfile();
  //       await fetchMarkers();
  //     } else {
  //       Alert.alert('Error', 'No user on the session!');
  //     }
  //   };

  //   initialize();
  // }, [session]);

  useEffect(() => { fetchMarkers() },[])

  async function getProfile() {
    try{
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    }
    
  }

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
        style={styles.map}
        initialRegion={{
          latitude: 1.294916,
          longitude: 103.773873,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0121,
        }}
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
    ...StyleSheet.absoluteFillObject,
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