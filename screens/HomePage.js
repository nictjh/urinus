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
  const featureIcons = {
    bidet: require('../assets/bidet.png'),
    handdryer: require('../assets/hand-dryer.png'),
  };
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
    // This function is used to fetch markers from backend
    const { data, error } = await supabase
      .from('toilets')
      .select('*');
    if (error) {
      console.log('Error fetching markers:', error);
    } else {
      setMarkers(data);
    }
  };

  const renderFeatureIcon = (featureAvailable, featureType) => {
    if (featureAvailable) {
      let iconSource = featureIcons[featureType];
      return <Image source={iconSource} style={{ width: 24, height: 24 }} />;
    }
    return null;
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedMarker(null); // Reset selected marker when modal closes
  };

  const handleSeeMorePress = () => {
    setModalVisible(false);
    setTimeout(() => {
      navigation.navigate('Details', { marker: selectedMarker });
    }, 300);
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
            key={marker.id}
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
        {selectedMarker && (
          <View style={styles.modalContainer} >
            <View style={styles.modalContent} >
              <Image
                source={require('../assets/testpic.jpg')}
                style={styles.modalImage}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.modalTitle}>{selectedMarker.room_name || 'No room name available'}</Text>
                <Text style={styles.modalRating}>
                  {selectedMarker.total_people_rated > 0 ?
                    (selectedMarker.total_cumulative_rating / selectedMarker.total_people_rated).toFixed(1) + ' ★' :
                    'No ratings yet'}
                </Text>
                <View style={styles.featuresContainer}>
                  {renderFeatureIcon(selectedMarker.bidet, 'bidet')}
                  {renderFeatureIcon(selectedMarker.handdryer, 'handdryer')}
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
                <Image
                  source={require('../assets/close.png')}
                  style={styles.closeButtonImage}
                />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={handleSeeMorePress}
                >
                  <Text style={styles.seeMoreButtonText}>See More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  modalContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 90,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalRating: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 10,
  },
  closeButtonImage: {
    width: 24,
    height: 24,
  },
  seeMoreButton: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  seeMoreButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomePage;