// This is the Dev Page to test code

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import MapView from '../map/mymap';
import Marker from '../map/mymapMar';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import ToiletCard from '../components/toiletCard'; // Import the component
import FloorsCarousel from '../components/FloorsCarousel';

function TrialScreen() {
    const { session } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const navigation = useNavigation();
    const mapRef = useRef(null);
    const [savedToilets, setSavedToilets] = useState([]);
    const [floorList, setFloorList] = useState([]);

    // Map functions
    const centerMapOnUserLocation = async () => {
        let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };

        mapRef.current?.animateToRegion(newRegion, 500);
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }
        })();
    }, []);

    // Marker functions
    const fetchMarkers = async () => {
        try {
            const { data, error, status } = await supabase
                .from('general_trial')
                .select('*');
            if (data) {
                setMarkers(data);
                console.log("Marker Data fetched\n: ", data);
            }
        } catch (error) {
            setMarkers([]);
            console.log("Error fetching markers");
        }
    };

    const handleMarkerPress = (marker) => {
        setSelectedMarker(marker); // then i need to process this
        setModalVisible(true);

        // try {
        //     // Parse the stringified arrays
        //     const maleFloors = JSON.parse(marker.male_floor ?? "[]");
        //     const femaleFloors = JSON.parse(marker.female_floor ?? "[]");
        //     const hdcpFloors = JSON.parse(marker.hdcp_floor ?? "[]");

        //     // Map the floors and add prefixes
        //     const floors = [
        //         ...maleFloors.map((floor) => `Male: Floor ${floor}`),
        //         ...femaleFloors.map((floor) => `Female: Floor ${floor}`),
        //         ...hdcpFloors.map((floor) => `Handicap: Floor ${floor}`),
        //     ];

        //     setFloorList(floors);
        //     console.log("FLOORS SPREAD::: ", floors);
        // } catch (error) {
        //     console.error("Error parsing floor data:", error);
        // }
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedMarker(null);
    };

    useEffect(() => {
        fetchMarkers();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                initialRegion={{
                    latitude: 1.2974546,
                    longitude: 103.7765514,
                    // latitude: 1.294826,
                    // longitude: 103.773999,
                    latitudeDelta: 0.0001,
                    longitudeDelta: 0.0001,
                }}
                ref={mapRef}
                style={styles.map}
                showsUserLocation={true}
                showsCompass={true}
                showsMyLocationButton={false}
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        description={marker.loc_name}
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
                {/* {selectedMarker && (
                    <ToiletCard
                        selectedMarker={selectedMarker}
                        handleModalClose={handleModalClose}
                        savedToilets={savedToilets}
                        session={session}
                    />
                )} */}
                <View style={styles.modalContainer}>
                    <FloorsCarousel data={selectedMarker} />
                    <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
                        <Image
                            source={require('../assets/close.png')}
                            style={styles.closeButtonImage}
                        />
                </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Align content to the bottom of the screen
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Optional: Semi-transparent background for the modal
    },
    closeButton: {
        position: 'absolute',
        top: 70, // Distance from the bottom of the screen
        right: 30
    },
    closeButtonImage: {
        width: 40,
        height: 40
    },
});

export default TrialScreen;
