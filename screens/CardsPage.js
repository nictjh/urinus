import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from '../lib/supabase';
import { Rating } from 'react-native-ratings';
import { getGlobalRefresh, setGlobalRefresh } from '../global/globVariables.js';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from '../styles/cards_page_styles.js';


function CardsPage() {
    const [reviews, setReviews] = useState([]);
    const [toiletMapping, setToiletMapping] = useState({});
    const [refreshStatus, setRefreshStatus] = useState(false);
    const [selectedSort, setSelectedSort] = useState("popular");
    const [open, setOpen] = useState(false); // To control the dropdown open/close state
    const [items, setItems] = useState([
        { label: 'Most Popular', value: 'popular' },
        { label: 'Most Controversial', value: 'controversial' },
        { label: 'Highest Rating', value: 'highestRated' },
        { label: 'Lowest Rating', value: 'lowestRated' },
        { label: 'Most Recent', value: 'mostRecent'}
    ]);

    const navigation = useNavigation();

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*');
        if (error) {
            console.log("Error fetching reviews: ", error);
        } else {
            const sortedData = data.sort((a, b) => {
                switch (selectedSort) {
                    case 'popular': // Sort by most likes
                        return b.likes - a.likes;
                    case 'controversial': // Sort by most dislikes
                        return b.dislikes - a.dislikes;
                    case 'highestRated': // Sort by rating descending
                        return b.rated - a.rated;
                    case 'lowestRated': // Sort by rating ascending
                        return a.rated - b.rated;
                    case 'mostRecent':
                        return new Date(b.created_at) - new Date(a.created_at);
                    default:
                        return 0;
                }
            });

            return sortedData;
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
                let mapping = {}; //mapping: key = toilet_uuid, val = toilet.room_name
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

    const handleDislike = async (uuid, curr_dislikes) => {
        const { error } = await supabase
            .from('reviews')
            .update({dislikes: curr_dislikes + 1})
            .eq('review_uuid', uuid);
        if (error) {
            console.log("Error fetching reviews: ", error);
        } else {
            fetchAndUpdateReviews();
        }
    };

    const handleLike = async (uuid, curr_likes) => {
        const { error } = await supabase
            .from('reviews')
            .update({likes: curr_likes + 1})
            .eq('review_uuid', uuid);
        if (error) {
            console.log("Error fetching reviews: ", error);
        } else {
            fetchAndUpdateReviews();
        }
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
                            <TouchableOpacity style={styles.likesButton} onPress={() => handleLike(review.review_uuid, review.likes)}>
                                <Text style={styles.likes}>{review.likes} Likes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.dislikesButton} onPress={() => handleDislike(review.review_uuid, review.dislikes)}>
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

    const fetchAndUpdateReviews = async () => {
        if (refreshStatus) {
            // When refreshStatus is true this will remount
            console.log("refreshStatus was true, hence remounting");
        }
            setRefreshStatus(false);
            setGlobalRefresh(false);
            let sortedReviews = await fetchReviews();
            setReviews(sortedReviews);
            markerMapping();
    };

    useEffect(() => {
        fetchAndUpdateReviews(); //do i need to call await here
    }, [refreshStatus, selectedSort]);
    

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
            <View style={styles.dropdownContainer}>
                <DropDownPicker
                    open={open}
                    value={selectedSort}
                    items={items}
                    setOpen={setOpen}
                    setValue={setSelectedSort}
                    setItems={setItems}
                    style={styles.dropdown}
                    dropDownStyle={styles.dropdownList}
                />
            </View>
            <ScrollView style={styles.scrollContainer}>
                {reviews.slice(0, 5).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </ScrollView>
        </View>
    );
};

export default CardsPage;
