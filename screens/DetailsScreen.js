import { supabase } from '../lib/supabase';
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { Rating } from 'react-native-ratings';


function DetailsScreen({ route, navigation }) {

  const { marker } = route.params;
    const uuid = marker.uuid;

    const [cubicles, setCubicles] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCounts, setReviewCounts] = useState({});

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

    useEffect(() => {
      fetchCubicles();
      fetchReviews();
    }, [uuid])


    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={require('../assets/testpic.jpg')} style={styles.image} />
        </View>
        <RatingDisplay rating={averageRating} count={reviews.length} />
        <ReviewDistribution reviews={reviewCounts} />
      </View>
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
})



export default DetailsScreen;