import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from '../lib/supabase';
import { Rating } from 'react-native-ratings';
import { getGlobalRefresh, setGlobalRefresh } from '../global/globVariables.js';
import { useNavigation } from '@react-navigation/native';

function CardsPage() {
    const [reviews, setReviews] = useState([]);
    const [toiletMapping, setToiletMapping] = useState({});
    const [refreshStatus, setRefreshStatus] = useState(false);

    const navigation = useNavigation();

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
        if (error) {
            console.log("Error fetching reviews: ", error);
        } else {
            const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setReviews(sortedData);
        }
    };

    const markerMapping = async () => {
        try {
            const { data, error } = await supabase
                .from('toilets')
                .select('*');
            if (error) {
                console.log("Error retrieving data from toilets table: ", error);
            } else {
                let mapping = {};
                data.forEach(item => mapping[item.uuid] = item.room_name);
                setToiletMapping(mapping);
            }
        } catch (error) {
            console.log("Database error, failed to run markerMapping: ", error);
        }
    };

    const refreshFunction = () => {
        const checkValue = getGlobalRefresh()
        if (checkValue == true) {
            setRefreshStatus(checkValue)
        }
    }

    const handleDislike = (uuid) => {
        console.log("Unhandled yet!");
    };

    const handleLike = (uuid) => {
        console.log("Unhandled yet!");
    };

    const ReviewCard = ({ review }) => {
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => handleCardPress(review.toilet_uuid)}>
                    <Image source={require('../assets/testpic.jpg')} style={styles.image} />
                    <View style={styles.content}>
                        <Text style={styles.name}>{toiletMapping[review.toilet_uuid]}</Text>
                        <Text style={styles.comment}>{review.reviewer ? review.reviewer : "User"}: {review.description}</Text>
                        <View style={styles.ratingLocation}>
                            <Rating
                                type="star"
                                readonly={true}
                                startingValue={parseFloat(review.rated)}
                                ratingCount={5}
                                imageSize={20}
                                tintColor={'#FFFFFF'}
                            />
                            <Text style={styles.location}>{review.cubicle_no ? "Cubicle Number " + review.cubicle_no : "Location not specified"}</Text>
                        </View>
                        <View style={styles.likesDislikes}>
                            <TouchableOpacity style={styles.likesButton} onPress={() => handleLike(review.review_uuid)}>
                                <Text style={styles.likes}>{review.likes} Likes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.dislikesButton} onPress={() => handleDislike(review.review_uuid)}>
                                <Text style={styles.dislikes}>{review.dislikes} Dislikes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshFunction();
        }, 1000);

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (refreshStatus) {
            // When refreshStatus is true this will remount
            console.log("refreshStatus was true, hence remounting")
        }
        //reset my global variables
        setRefreshStatus(false)
        setGlobalRefresh(false)
        fetchReviews();
        markerMapping();
    }, [refreshStatus]);

    const handleCardPress = async (uuid) => {
        let item = {};
        try {
            const { data, error } = await supabase
                .from('toilets')
                .select('*')
                .eq('uuid', uuid);
            if (error) {
                console.log("Error retrieving data from toilets table: ", error);
            } else {
                item = data[0];
            }
        } catch (error) {
            console.log("Database error, failed to run handleCardPress: ", error);
        }
        setTimeout(() => {
            navigation.navigate('Details', { marker: item });
        }, 300);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Reviews</Text>
            </View>
            <ScrollView style={styles.scrollContainer}>
                {reviews.slice(0, 5).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    header: {
        backgroundColor: 'white',
        paddingTop: 80,
        paddingHorizontal: 20,
        paddingBottom: 10,
        justifyContent: "flex-end",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scrollContainer: {
        padding: 20
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginVertical: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    content: {
        padding: 15,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    comment: {
        color: '#333',
        fontSize: 16,
        marginTop: 5,
    },
    ratingLocation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    location: {
        color: '#555',
    },
    likesDislikes: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    likes: {
        marginRight: 20,
        color: '#555',
    },
    dislikes: {
        color: '#555',
    },
});


export default CardsPage;
