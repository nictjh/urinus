import { supabase } from '../lib/supabase';
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { Rating } from 'react-native-ratings';
import { useNavigation } from '@react-navigation/native';


function DetailsScreen({ route }) {

  const { marker } = route.params;
  const navigation = useNavigation();
  const uuid = marker.uuid;

  const [cubicles, setCubicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCounts, setReviewCounts] = useState({});
  const [expanded, setExpanded] = useState(false);

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
      <View style={styles.barContainer}>
        <Text style={styles.starCount}>{starCount} Star</Text>
        <View style={styles.bar}>
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

  const ReviewCard = ({ review }) => {
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

  const amenities = [
    { key: 'wifi', label: 'Wi-Fi', value: marker.avg_wifi_connectivity ? marker.avg_wifi_connectivity + " bars" : 'Unrated', emoji: '📶' },
    { key: 'bidet', label: 'Bidet', value: marker.bidet ? 'Available' : 'Unavailable', emoji: '🚽' },
    { key: 'mirror', label: 'Mirror', value: marker.mirrors ? marker.mirrors + "/5 in cleanliness" : 'Unrated', emoji: '🪞' },
    { key: 'handdryer', label: 'Hand Dryer', value: marker.handdryer ? 'Available' : 'Unavailable', emoji: '🌬️' },
    { key: 'sanitarybin', label: 'Sanitary Bin', value: marker.sanitarybin ? 'Available' : 'Unavailable', emoji: '🗑️' },
    { key: 'handicapped', label: 'Handicapped Toilet', value: marker.handicapped ? 'Present' : 'Absent', emoji: '♿' }
  ];

  useEffect(() => {
    fetchCubicles();
    fetchReviews();
  }, [uuid])


  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../assets/testpic.jpg')} style={styles.image} />
      </View>
      <RatingDisplay rating={averageRating} count={reviews.length} />
      <ReviewDistribution reviews={reviewCounts} />

      <View style={styles.reviewButContainer}>
        <Button title='Submit a review' onPress={() => navigation.navigate('Review')}/>
      </View>

      {reviews.slice(0, expanded ? reviews.length : 1).map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={toggleExpanded}>
          <Text>{expanded ? "Hide" : "Show All Reviews"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.amenitiesContainer}>
      {amenities.map((item, index) => (
        <View key={index} style={styles.amenity}>
          <Text style={styles.amenityText}>{item.emoji} {`${item.label}: ${item.value}`}</Text>
        </View>
      ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
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
  image: {
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
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  starCount: {
    width: 50,
    fontSize: 16,
  },
  bar: {
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
  }
})



export default DetailsScreen;