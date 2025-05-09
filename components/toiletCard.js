import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Correct this for the new toiletCard info

const ToiletCard = ({ selectedMarker, handleModalClose, savedToilets, session }) => {
  const navigation = useNavigation();
  const featureIcons = {
        bidet: require('../assets/bidet.png'),
        handdryer: require('../assets/hand-dryer.png'),
        fav: require('../assets/heart.png'),
        unfav: require('../assets/yellowHeart.png')
    };

    const renderFeatureIcon = (featureAvailable, featureType) => {
        if (featureAvailable) {
            let iconSource = featureIcons[featureType];
            return <Image source={iconSource} style={{ width: 35, height: 35 }} />;
        }
        return null;
    };

    const renderHeartIcon = (roomName) => {
        const isSaved = savedToilets.includes(roomName);
        const iconSource = isSaved ? featureIcons["unfav"] : featureIcons["fav"];
        return <Image source={iconSource} style={{ height: 30, width: 30 }} />;
    };

    const handleSeeMorePress = () => {
      setTimeout(() => {
        navigation.navigate('Details', { marker: selectedMarker });
      }, 300);
    };

    const handleFavPress = async () => {
      const currRoomName = selectedMarker.room_name;
      let updatedToilets = [];

      if (savedToilets.includes(currRoomName)) { // if it alr exists
        updatedToilets = savedToilets.filter(room => room !== currRoomName) //removes the room
      } else {
        // if it doesnt exist
        updatedToilets = [...savedToilets, currRoomName];
      }

      setSavedToilets(updatedToilets);

      try {
        const { error } = await supabase
              .from('profiles')
              .update({ saved_toilets: updatedToilets.join(',') })  // Converts array back to String to store
              .eq('id', session.user.id);

          if (error) throw error;

          Alert.alert("Success", `Favorites updated successfully.`)
      } catch (error) {
        console.error('Error updating favorites:', error);
          Alert.alert("Error", "Failed to update favorites.");
          setSavedToilets(savedToilets);
      }
    };

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Image
                    source={require('../assets/testpic.jpg')}
                    style={styles.modalImage}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.modalTitle}>{selectedMarker.loc_name || 'No room name available'}</Text>
                    <Text style={styles.modalRating}>
                        {selectedMarker.total_people_rated > 0
                            ? (selectedMarker.total_cumulative_rating / selectedMarker.total_people_rated).toFixed(1) + ' ★'
                            : 'No ratings yet'}
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
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            style={styles.seeMoreButton}
                            onPress={handleSeeMorePress}
                        >
                            <Text style={styles.seeMoreButtonText}>See More</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.favButton}
                            onPress={handleFavPress}
                            disabled={!session}
                        >
                            {renderHeartIcon(selectedMarker.room_name)}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        top: 0,
        right: 3,
    },
    closeButtonImage: {
        width: 24,
        height: 24,
    },
    seeMoreButton: {
        padding: 10,
        marginTop: 15,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        alignItems: 'center',
        flex: 5
    },
    favButton: {
        padding: 10,
        marginTop: 10,
        flex: 0.5
    },
    seeMoreButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default ToiletCard;
