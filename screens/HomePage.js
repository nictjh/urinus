import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Alert, Image, Switch } from 'react-native';
//import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import MapView from '../map/mymap';
import Marker from '../map/mymapMar';
import * as Location from 'expo-location';
import { Dropdown, MultiSelect } from 'react-native-searchable-dropdown-kj';
import { Picker } from '@react-native-picker/picker';
import { color } from '@rneui/themed/dist/config';


function HomePage({ navigation }) {

  const { session } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    bidet: false,
    handdryer: false,
    room_code: 'All', // will hold 'COM1', 'COM2', or 'COM3'
  });
  const [filteredList, setFilteredList] = useState([]); // bro we are USING USESTATE SO MUCH HAHAHAHAHA


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

  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <View style={styles.dropDownContainer}>
          <View style={styles.dropDownIconsContainer}>
            <Image
              source={require('../assets/testpic.jpg')}
              style={styles.dropDownImage}
            />
            <View style={styles.dropDownFeaturesContainer}>
              {renderFeatureIcon(item.bidet, 'bidet')}
              {renderFeatureIcon(item.handdryer, 'handdryer')}
            </View>
          </View>
          <View style={styles.dropDownInfoContainer}>
            <Text style={styles.modalTitle}>{item.room_name || 'No room name available'}</Text>
            <Text style={styles.modalRating}>
              {item.total_people_rated > 0 ?
                (item.total_cumulative_rating / item.total_people_rated).toFixed(1) + ' ★' :
                'No ratings yet'}
            </Text>
          </View>
        </View>
      </View>
    );
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
    try {
      let query = supabase
        .from('toilets')
        .select('*');

      if (filters.bidet) {
        query = query.filter('bidet', 'eq', true);
      }
      if (filters.handdryer) {
        query = query.filter('handdryer', 'eq', true);
      }
      if (filters.room_code !== 'All') {
        query = query.filter('room_code', 'eq', filters.room_code);
      }

      const { data, error } = await query;

      if (error) {
        console.log('Error fetching markers:', error);
        setMarkers([]); // Handle error by setting markers to an empty array
        setFilteredList([]);
      } else {
        setMarkers(data || []); // Handle no data scenario
        setFilteredList(data || []);
      }
    } catch (error) {
      console.log('Supabase error:', error.message);
      setMarkers([]);
      setFilteredList([]);
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

  const handleDropDownItemPress = (item) => {
    setTimeout(() => {
      navigation.navigate('Details', { marker: item });
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
        showsUserLocation={false}
        showsCompass={true}
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
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={markers}
        search
        maxHeight={500}
        valueField="id"
        labelField="room_name"
        placeholder="Search for toilets"
        searchPlaceholder="Search for your toilets :)"
        onChange={item => {
          handleDropDownItemPress(item);
        }}
        renderItem={renderItem}
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Image
          source={require('../assets/filter.png')}
          style={styles.filterButtonImage}
        />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalView}>
          <View style={styles.filterColumn}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Bidet</Text>
              <Switch
                value={filters.bidet}
                onValueChange={(newValue) => setFilters({ ...filters, bidet: newValue })}
              />
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Hand Dryer</Text>
              <Switch
                value={filters.handdryer}
                onValueChange={(newValue) => setFilters({ ...filters, handdryer: newValue })}
              />
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Room Code</Text>
              <Picker
                selectedValue={filters.room_code}
                style={styles.filterPicker}
                onValueChange={(itemValue, itemIndex) => setFilters({ ...filters, room_code: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="COM1" value="COM1" />
                <Picker.Item label="COM2" value="COM2" />
                <Picker.Item label="COM3" value="COM3" />
              </Picker>
            </View>

            <View style={styles.filterApplyButton}>
              <TouchableOpacity onPress={() => {
                fetchMarkers();
                setFilterModalVisible(false);
              }}>
                <Text style={styles.filterApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal >
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
    </View >
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
  dropdown: {
    margin: 16,
    height: 50,
    width: '65%',
    position: 'absolute',
    top: 50,
    left: "1%",
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  dropDownContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dropDownInfoContainer: {
    flex: 3,
    paddingLeft: 15,
  },
  dropDownIconsContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  dropDownImage: {
    height: 50,
    width: 50,
    borderRadius: 10,
    paddingBottom: 50,
  },
  dropDownFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  item: {
    padding: 17,
    flex: 1,
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  filterModalView: {
    marginHorizontal: 20,
    marginTop: 150,
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
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterColumn: {
    flexDirection: 'column',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 18,
    paddingRight: 10,
  },
  filterPicker: {
    height: 50,
    width: 120,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: 'lightgray',
    color: 'black',
    opacity: 0.8,
  },
  filterButton: {
    margin: 16,
    height: 50,
    width: 50,
    position: 'absolute',
    top: 50,
    right: "10%",
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    alignContent: 'center',
    flexDirection: 'column',
  },
  filterButtonImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  filterApplyButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 5,
  },
  filterApplyText: {
    color: 'white',
    fontSize: 18,
    padding: 5,
  },
});

export default HomePage;