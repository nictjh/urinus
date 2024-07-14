import { supabase } from '../lib/supabase';
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { Rating } from 'react-native-ratings';
import { useNavigation } from '@react-navigation/native';
import { setGlobalRefresh } from '../global/globVariables.js';
import { usePushNotifications } from '../global/usePushNotification.js';


function DetailsScreen({ route }) {

  const { marker } = route.params;
  const navigation = useNavigation();
  const uuid = marker.uuid;

  const [cubicles, setCubicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCounts, setReviewCounts] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCubicle, setCurrentCubicle] = useState(null); // to pass correct values
  const [cubicleStatus, setCubicleStatus] = useState(false); // to refresh and remount components
  const { expoPushToken } = usePushNotifications();

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const fetchCubicles = async (id) => {
    const { data, error } = await supabase
      .from('cubicles')
      .select('*')
      .eq('toilet_uuid', uuid);
    if (error) {
      console.log("Error fetching cubicles: ", error);
    } else {
      setCubicles(data);
    }
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('toilet_uuid', uuid);
    if (error) {
      console.log("Error fetching reviews specific to uuid: ", error);
    } else {
      setReviews(data);
      if (data.length > 0) {
        // Calculate average reviews
        const totalRating = data.reduce((wish, curr) => wish + curr.rated, 0);
        const average = (totalRating / data.length).toFixed(1);
        setAverageRating(average);
        // Calculate count reviews
        const counts = data.reduce((acc, review) => {
          acc[review.rated] = (acc[review.rated] || 0) + 1;
          return acc;
        }, {});
        setReviewCounts(counts);
      } else {
        setAverageRating(0);
        setReviewCounts({});
      }
    }
  };

  const handleIssue = async (selectedIssue, uuid, cubNumber) => {
    // Handle report button (two scenarios, 'clog' or 'tissue')
    console.log(uuid);
    setModalVisible(false);
    try {
      // Update errors table with new instant report (need to handle the duplicates so it will show properly)
      const { response, error, status } = await supabase
        .from('errors')
        .select('*')
        .eq('toilet_uuid', uuid)
        .eq('cubicle_no', cubNumber);
      console.log(response);
      if (response) {
        console.log("Updating current response!")
        try {
          const {data , error, status} = await supabase
            .from('errors')
            .update({
              description: "Instant report: " + selectedIssue,
            })
            .eq('toilet_uuid', uuid)
            .eq('cubicle_no', cubNumber)
          if (error) {
            console.log("Failed to insert data into errors table", error);
          }
          console.log("Successfully inserted report!", data);
        } catch (error) {
          console.log("Error with database operation", error);
        }
      } else {
        console.log("Creating new error row")
        try {
          const {data , error, status} = await supabase
            .from('errors')
            .insert({
              toilet_uuid: uuid,
              cubicle_no: cubNumber,
              description: "Instant report: " + selectedIssue,
            });
          if (error) {
            console.log("Failed to insert data into errors table", error);
          }
          console.log("Successfully inserted report!", data);
        } catch (error) {
          console.log("Error with database operation", error);
        }
      }
      // Handle refresh in alert page
      setGlobalRefresh(true);

    } catch (error) {
      console.log("Error with database operation", error)
    }

    // Updates Cubicle Table with new status section:
    if (selectedIssue === "Tissue") {
      try {
        const { data, error, status } = await supabase
          .from('cubicles')
          .update({ tissue: false })
          .eq('cubicle_no', cubNumber)
          .eq('toilet_uuid', uuid);

        if (error) {
          console.error("Error updating tissue status", error);
        }
        console.log('Update successful', data);
      } catch (error) {
        console.error("Caught an error during the update operation", error);
      }
    } else if (selectedIssue === "Clog") {
      try {
        const { data, error, status } = await supabase
          .from('cubicles')
          .update({ status: false })
          .eq('cubicle_no', cubNumber)
          .eq('toilet_uuid', uuid);

        if (error) {
          console.error("Error updating status", error);
        }
        console.log('Update successful', data);
      } catch (error) {
        console.error("Caught an error during the update operation", error);
      }
    } else {
      console.log("Not Handled!");
    }
    // I need to setState so i can refresh everything
    console.log("expoPushToken retrieved: ",expoPushToken);
    const notifMessage = `ALERT! Reports that Cubicle ${cubNumber} near ${marker.room_name} has a ${selectedIssue} issue.`;
    sendPushNotification(expoPushToken, notifMessage);
    setCubicleStatus(!cubicleStatus);
  };


  const sendPushNotification = async (expoPushToken, messageBody) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'UriNUS',
      body: messageBody,
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };





  // Creating star component
  const RatingDisplay = ({rating, count}) => {
    return (
      <View style={styles.ratingContainer}>
        <Rating
          type="star"
          readonly={true}
          startingValue={parseFloat(rating)}
          ratingCount={5}
          imageSize={25}
          tintColor={'#F0F0F0'}  // bg color
        />
        <Text style={styles.ratingText}>
          {count > 0 ? `${rating} / 5 based on ${count} Reviews` : "No reviews yet"}
        </Text>
      </View>
    )
  };


  // Creating display distri
  const ReviewBar = ({ starCount, percentage }) => {
    return (
      <View style={styles.reviewBarContainer}>
        <Text style={styles.starCount}>{starCount} Star</Text>
        <View style={styles.backgroundBar}>
          <View style={[styles.filledBar, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  const ReviewDistribution = ({ reviews }) => {
    const totalReviews = Object.values(reviews).reduce((sum, curr) => sum + curr, 0);

    return (
      <View>
        {Object.keys(reviews).sort((a, b) => b - a).map((star) => (
          <ReviewBar
            key={star}
            starCount={star}
            percentage={(reviews[star] / totalReviews) * 100}
          />
        ))}
      </View>
    );
  };

  const ReviewCard = ({ review }) => { // Future enhancements to change reviewerName
    return (
      <View style={styles.reviewCard}>
        <Text style={styles.reviewerName}>Annonymous Butterfly</Text>
        <Rating
          type="star"
          readonly={true}
          startingValue={review.rated}
          ratingCount={5}
          imageSize={15}
        />
        <Text style={styles.reviewCubicle}>{review.cubicle}</Text>
        <Text style={styles.reviewText}>{review.description}</Text>
      </View>
    );
  };

  const CubicleCard = ({ cubicle }) => {
    return (
      <View style={styles.cubicleCard}>
         {!cubicle.status && (
          <View style={styles.reportOverlay}>
            <Text style={styles.reportOverlayText}>X</Text>
          </View>
        )}
        <Image source={require('../assets/toiletBowl.jpg')} style={styles.toiletImage} />
        <View style={styles.cubicleDetailsContainer}>
          <Text style={styles.cubicleTitle}>Cubicle No: {cubicle.cubicle_no}</Text>
          <View style={styles.amenityCubText}>
            <Image source={require('../assets/toilet.png')} style={styles.cubicleIcon} />
            <Text> Toilet Bowl</Text>
          </View>
          <View style={styles.amenityCubText}>
            <Image source={require('../assets/spray.png')} style={styles.cubicleIcon} />
            <Text> Bidet: {cubicle.bidet ? 'Available' : 'Not Available'}</Text>
          </View>
          <View style={styles.amenityCubText}>
            <Image source={require('../assets/wifi.png')} style={styles.cubicleIcon} />
            <Text> Wi-Fi: {cubicle.wifi_connectivity ? `${cubicle.wifi_connectivity} Bars` : 'No Wi-Fi'}</Text>
          </View>
          <View style={styles.amenityCubText}>
            <Image source={require('../assets/disabled.png')} style={styles.cubicleIcon} />
            <Text> Handicapped: {cubicle.handicap ? 'Accessible' : 'Not Accessible'}</Text>
          </View>
          <View style={styles.amenityCubText}>
            <Image source={require('../assets/toilet-paper.png')} style={styles.cubicleIcon} />
            <Text> Tissue: {cubicle.tissue ? 'Available' : 'No Tissue'}</Text>
          </View>
          <View style={styles.amenityCubText}>
            <Image source={require('../assets/gender-male.png')} style={styles.cubicleIcon} />
            <Text> Gender: {cubicle.gender}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.reportButton} onPress={() => {
          setCurrentCubicle(cubicle.cubicle_no);
          setModalVisible(true);
        }}>
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>


        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.reportModal}>
              <Text style={{ marginBottom: 20 }}>Select an issue:</Text>
              <Button
                title="Clog Toilet"
                onPress={() => handleIssue('Clog', uuid, currentCubicle)}
              />
              <Button
                title="No Tissue"
                onPress={() => handleIssue('Tissue', uuid, currentCubicle)}
              />
              <Button
                title="Cancel"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </Modal>


      </View>
    );
  };

  const amenities = [
    { key: 'wifi', label: 'Wi-Fi', value: marker.avg_wifi_connectivity ? marker.avg_wifi_connectivity + " bars" : 'Unrated', emoji: '📶' },
    { key: 'bidet', label: 'Bidet', value: marker.bidet ? 'Available' : 'Unavailable', emoji: '🚽' },
    { key: 'mirror', label: 'Mirror', value: marker.mirrors ? marker.mirrors + "/5 in cleanliness" : 'Unrated', emoji: '🪞' },
    { key: 'handdryer', label: 'Hand Dryer', value: marker.handdryer ? 'Available' : 'Unavailable', emoji: '🌬️' },
    { key: 'sanitarybin', label: 'Sanitary Bin', value: marker.sanitarybin ? 'Available' : 'Unavailable', emoji: '🗑️' },
    { key: 'handicapped', label: 'Handicapped Toilet', value: marker.handicapped ? 'Present' : 'Absent', emoji: '♿' }
  ];

  useEffect(() => {
    fetchCubicles(uuid);
    fetchReviews();
  }, [uuid, cubicleStatus])


  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.toiletCard}>
          <Image source={require('../assets/testpic.jpg')} style={styles.toiletMainImage} />
        </View>
        <RatingDisplay rating={averageRating} count={reviews.length} />
        <ReviewDistribution reviews={reviewCounts} />

        <View style={styles.reviewButContainer}>
          <TouchableOpacity
            style={styles.submitReviewButton}
            onPress={() => { console.log(marker); navigation.navigate('Review', { markerToPass : marker })}}
          >
            <Image
              source={require('../assets/circle-plus.png')}
              style={{height: 25, width: 25, marginRight: 10}}
            />
            <Text style={styles.buttonText}>Submit a Review</Text>
          </TouchableOpacity>
        </View>

        {reviews.slice(0, expanded ? reviews.length : 1).map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
        <View style={styles.toggleContainer}>
          <TouchableOpacity onPress={toggleExpanded}>
            <Text>{expanded ? "Hide" : "Show All Reviews"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>{marker.room_name}, Toilet Details</Text>
        <View style={styles.amenitiesContainer}>
          {amenities.map((item, index) => (
            <View key={index} style={styles.amenity}>
              <Text style={styles.amenityText}>{item.emoji} {`${item.label}: ${item.value}`}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Cubicle Details</Text>
        {cubicles && cubicles.length > 0 ? (
          cubicles.map((cubicle) => (
            <CubicleCard key={cubicle.id} cubicle={cubicle} />
          ))
        ) : (
          <Text style={styles.noDataText}>No cubicle details available.</Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  },
  container: {
    padding: 20,
    flex: 1,
  },
  toiletCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  toiletMainImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  reviewBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  starCount: {
    width: 50,
    fontSize: 16,
  },
  backgroundBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
    overflow: 'hidden',
  },
  filledBar: {
    height: '100%',
    backgroundColor: 'orange',
  },
  reviewCard: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  reviewCubicle: {
    fontSize: 12,
    color: 'grey'
  },
  reviewText: {
    marginTop: 2
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 15,
    paddingBottom: 10
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  reviewButContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitReviewButton: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
  amenitiesContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  amenityText: {
    marginLeft: 10,
    fontSize: 16
  },
  cubicleCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginVertical: 5,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 10,
  },
  toiletImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain'
  },
  cubicleDetailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  cubicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amenityCubText: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  cubicleIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  reportButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    margin: 5,
    alignSelf: 'center',
  },
  reportButtonText: {
    color: '#007bff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 16,
    color: 'grey',
    textAlign: 'center',
    marginTop: 20
  },
  reportModal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBackdrop: { // Focus mode (grey out backgrounds)
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Semi-transparent red overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  reportOverlayText: {
    fontSize: 120,
    color: 'white',
    fontWeight: 'bold',
  },
})



export default DetailsScreen;