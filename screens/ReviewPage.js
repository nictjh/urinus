import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Text, Modal, Switch, Image, Alert, TextInput, Button } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from '../lib/supabase';
import { Dropdown } from 'react-native-searchable-dropdown-kj';
import RNPickerSelect from 'react-native-picker-select';
import { Rating } from 'react-native-ratings';
import { setGlobalRefresh } from '../global/globVariables';
// const markerFile =  require('../markers.json');

function ReviewPage({ route }) {
    const { markerToPass } = route.params // Check for null then assign
    const { session } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);
    const [cubicles, setCubicles] = useState([{ label: 'NA', value: "NA" }]);
    const [selectedCubicle, setSelectedCubicle] = useState("NA");
    const [filters, setFilters] = useState({
        minRating: 0, // will hold 0, 1, 2, 3, 4, or 5
        bidet: false,
        handdryer: false,
        sanitaryBin: false,
        noReports: true,
        handicap: false,
        room_code: 'All', // will hold 'All', 'COM1', 'COM2', or 'COM3'
        gender: 'All', // will hold 'All', 'male' or 'female'
    });
    const featureIcons = {
        bidet: require('../assets/bidet.png'),
        handdryer: require('../assets/hand-dryer.png'),
    };

    useEffect(() => {
        if (markerToPass) {
            setSelectedMarker(markerToPass);
        }
    }, [markerToPass]);

    useEffect(() => {
        fetchMarkers();
        getCubicles();
    }, [selectedMarker]);


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

    const renderFeatureIcon = (featureAvailable, featureType) => {
        if (featureAvailable) {
            let iconSource = featureIcons[featureType];
            return <Image source={iconSource} style={{ width: 24, height: 24 }} />;
        }
        return null;
    };

    const fetchMarkers = async () => {
        let query = supabase.from('toilets').select('*');

        // Apply boolean filters
        if (filters.bidet) {
            query = query.is('bidet', true);
        }
        if (filters.handdryer) {
            query = query.is('handdryer', true);
        }
        if (filters.sanitaryBin) {
            query = query.is('sanitarybin', true);
        }
        if (filters.handicap) {
            query = query.is('handicapped', true);
        }

        // Exclude toilets with reports if noReports is true
        if (filters.noReports) {
            query = query.eq('errors_reported', 0);
        }

        // Apply filters for room_code
        if (filters.room_code !== 'All') {
            query = query.eq('room_code', filters.room_code);
        }

        // Apply filters for gender
        if (filters.gender !== 'All') {
            query = query.eq('gender', filters.gender);
        }

        try {
            const { data, error } = await query;
            if (error) throw error;

            // Filter based on rating calculated from total_cumulative_rating and total_people_rated
            const filteredData = data.filter(item => {
                const rating = item.total_people_rated > 0 ? item.total_cumulative_rating / item.total_people_rated : 0;
                return rating >= filters.minRating;
            });

            setMarkers(filteredData);
        } catch (error) {
            console.error('Error fetching markers:', error);
            setMarkers([]); // Optionally clear markers or handle the error differently
        }
    };

    const getCubicles = async () => {
        if (!selectedMarker) {
            setCubicles([]);
            return;
        }
        try {
            let query = supabase
                .from('cubicles')
                .select('cubicle_no')
                .eq('toilet_uuid', selectedMarker.uuid)
                .order('cubicle_no', { ascending: true });

            const { data, error } = await query;
            let dataCopy = data;

            if (error) {
                console.log('Error fetching cubicles:', error);
                setCubicles([{ label: "NA", value: "NA" }]); // Handle error by setting cubicles to a default array
            } else {
                for (let i = 0; i < dataCopy.length; i++) {
                    dataCopy[i] = { label: dataCopy[i].cubicle_no.toString(), value: dataCopy[i].cubicle_no.toString() };
                }
                dataCopy = [{ label: "NA", value: "NA" }, ...dataCopy];
                setCubicles(dataCopy);
            }
        } catch (error) {
            console.log('Supabase error:', error.message);
            setCubicles([]);
        }
    };

    const submitData = async () => {
        if (selectedMarker === null || rating === 0) {
            Alert.alert('Please fill in all fields properly before submitting.', 'Fields marked with * are required. Please re-select your toilet if you have just submitted a rating!');
            return;
        }
        try {
            if (selectedCubicle === "NA" || selectedCubicle === "NIL") {
                setSelectedCubicle(null);
            } else {
                setSelectedCubicle(parseInt(selectedCubicle));
            }
            const { data, error } = await supabase
                .from('reviews')
                .insert([
                    {
                        toilet_uuid: selectedMarker.uuid,
                        cubicle_no: selectedCubicle,
                        description: description,
                        rated: rating,
                    },
                ]);
            // Handle refresh in cardPage
            setGlobalRefresh(true);
            if (error) {
                Alert.alert('Error inserting data:', error);
            } else {
                Alert.alert('Review submitted!', 'Thank you for your feedback!');
            }
        } catch (error) {
            console.log('Supabase error:', error.message);
        }
        try {
            // Think this will always run
            const { data, error } = await supabase
                .from('toilets')
                .update({
                    total_people_rated: selectedMarker.total_people_rated + 1,
                    total_cumulative_rating: selectedMarker.total_cumulative_rating + rating
                })
                .eq('uuid', selectedMarker.uuid);
            if (error) {
                console.log('Error updating toilet rating data:', error);
            } else {
                setSelectedMarker(null);
                setDescription('');
                setRating(0);
                console.log('Rating updated successfully:', data);
                // Update local state or perform further actions as needed
            }
        } catch (error) {
            console.log('Supabase error:', error.message);
        }

    }

    return (
        <View style={styles.container}>
            {(filterModalVisible) && (
                <View style={styles.overlay} />
            )}
            <View style={styles.card}>
                <View style={styles.selectContainer}>
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
                        placeholder="Select a toilet to rate! *"
                        searchPlaceholder="Search for your toilets :)"
                        value={ selectedMarker ? selectedMarker.id : null }
                        onChange={item => {
                            setSelectedMarker(item); //State update happens but the component doesnt remount so it will not update current stuff
                            getCubicles();
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
                                    <Text style={styles.filterLabel}>Min. Rating</Text>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Rating
                                            type="star"
                                            startingValue={filters.minRating}
                                            ratingCount={5}
                                            imageSize={25}
                                            tintColor={'#F0F0F0'}  // bg color
                                            onSwipeRating={(itemValue) => setFilters({ ...filters, minRating: itemValue })}
                                            onFinishRating={(itemValue) => setFilters({ ...filters, minRating: itemValue })}
                                        />
                                    </View>
                                </View>
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
                                    <Text style={styles.filterLabel}>Sanitary Bin</Text>
                                    <Switch
                                        value={filters.sanitaryBin}
                                        onValueChange={(newValue) => setFilters({ ...filters, sanitaryBin: newValue })}
                                    />
                                </View>
                                <View style={styles.filterRow}>
                                    <Text style={styles.filterLabel}>No Reports</Text>
                                    <Switch
                                        value={filters.noReports}
                                        onValueChange={(newValue) => setFilters({ ...filters, noReports: newValue })}
                                    />
                                </View>
                                <View style={styles.filterRow}>
                                    <Text style={styles.filterLabel}>Handicap</Text>
                                    <Switch
                                        value={filters.handicap}
                                        onValueChange={(newValue) => setFilters({ ...filters, handicap: newValue })}
                                    />
                                </View>
                                <View style={styles.filterRow}>
                                    <Text style={styles.filterLabel}>Room Code</Text>
                                    <RNPickerSelect
                                        onValueChange={(itemValue) => setFilters({ ...filters, room_code: itemValue })}
                                        items={[
                                            { label: 'All', value: 'All' },
                                            { label: 'COM1', value: 'COM1' },
                                            { label: 'COM2', value: 'COM2' },
                                            { label: 'COM3', value: 'COM3' },
                                        ]}
                                        style={pickerSelectStyles}
                                        useNativeAndroidPickerStyle={false}
                                        value={filters.room_code}
                                    />
                                </View>
                                <View style={styles.filterRow}>
                                    <Text style={styles.filterLabel}>Gender</Text>
                                    <RNPickerSelect
                                        onValueChange={(itemValue) => setFilters({ ...filters, gender: itemValue })}
                                        items={[
                                            { label: 'All', value: 'All' },
                                            { label: 'male', value: 'male' },
                                            { label: 'female', value: 'female' },
                                        ]}
                                        style={pickerSelectStyles}
                                        useNativeAndroidPickerStyle={false}
                                        value={filters.gender}
                                    />
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
                </View>
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Cubicle Number</Text>
                    <RNPickerSelect
                        onValueChange={setSelectedCubicle}
                        items={cubicles}
                        ascending={true}
                        style={pickerSelectStyles}
                        useNativeAndroidPickerStyle={false}
                        value={selectedCubicle}
                        placeholder={{ label: 'Select Cubicle', value: "NIL" }}
                    />
                </View>
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Rating *</Text>
                    <View style={{ flexDirection: 'column' }}>
                        <Rating
                            type="star"
                            startingValue={rating}
                            ratingCount={5}
                            imageSize={25}
                            tintColor={'#F0F0F0'}  // bg color
                            onSwipeRating={setRating}
                            onFinishRating={setRating}
                        />
                    </View>
                </View>
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Description</Text>
                    <TextInput
                        style={styles.description}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>
                <Button title="Submit Review" onPress={submitData} style={{ borderRadius: 15 }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f4f4f8', // Lighter background for better contrast
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowRadius: 8,
        shadowOpacity: 0.2,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 3 },
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 430,
    },
    description: {
        height: 100,
        width: '60%',
        textAlignVertical: 'top', // Align text to top for multiline input
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#ffffff', // Ensures the text input is distinctly visible
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333', // Darker text for better readability
    },
    modalRating: {
        fontSize: 16,
        color: '#666', // Slightly lighter than modalTitle for hierarchy
    },
    dropdown: {
        flex: 5,
        height: 50,
        width: '75%',
        position: 'absolute',
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
    selectContainer: {
        flexDirection: 'column',
        alignItems: 'space-between',
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
        marginTop: 100,
        marginHorizontal: 20,
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
    filterButton: {
        height: 50,
        width: 50,
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
    slider: {
        flex: 1,
        height: 40,
    },
    overlay: { // using this cos its basically the same as the blur module
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1  // ensuring da overlay is below the modal but above other content
    },
});

const pickerSelectStyles = { // for the dropdown picker roomie pls dont put normal styles hereeeee
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        width: 120,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        width: 120,
    },
};

export default ReviewPage;
