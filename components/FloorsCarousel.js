import React, { useState, useEffect, useCallback } from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import { interpolate } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { faker } from "@faker-js/faker";
import { BlurView } from "expo-blur";
import { Dimensions } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';

const window = Dimensions.get('window');

const FloorsCarousel = ({ data }) => {
    //Data coming in is the markerData
    const [floors, setFloors] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        if (!data) {
            console.error("No data passed to FloorsCarousel");
            return;
        }

        try {
            const maleFloors = JSON.parse(data.male_floor ?? "[]");
            const femaleFloors = JSON.parse(data.female_floor ?? "[]");
            const hdcpFloors = JSON.parse(data.hdcp_floor ?? "[]");

            console.log("Parsed male floors:", maleFloors);
            console.log("Parsed female floors:", femaleFloors);
            console.log("Parsed handicap floors:", hdcpFloors);

            const maleFloorsWithPrefix = maleFloors.map(
                ([floor, toilet_uuid]) => [`Male Floor: ${floor}`, toilet_uuid]
            );
            const femaleFloorsWithPrefix = femaleFloors.map(
                ([floor, toilet_uuid]) => [`Female Floor: ${floor}`, toilet_uuid]
            );
            const hdcpFloorsWithPrefix = hdcpFloors.map(
                ([floor, toilet_uuid]) => [`Handicap Floor: ${floor}`, toilet_uuid]
            );

            // Combine all the floors into a single array
            const allFloors = [
                ...maleFloorsWithPrefix,
                ...femaleFloorsWithPrefix,
                ...hdcpFloorsWithPrefix,
            ];

            setFloors(allFloors);
            console.log(allFloors); // Logging for error checking
        } catch (error) {
            console.error("Error parsing floor data:", error);
        }
    }, [data]); // My new data representation is [floor, toilet_uuid] - so i need to generate those in the future


    const scale = 1;
    const RIGHT_OFFSET = window.width * (1 - scale);
    const ITEM_WIDTH = window.width * scale;
    const ITEM_HEIGHT = 120;
    const PAGE_HEIGHT = window.height; // Use the full screen height
    const PAGE_WIDTH = window.width; // Use the full screen width

    const animationStyle = useCallback((value) => {
        "worklet";

        const translateY = interpolate(value, [-1, 0, 1], [-ITEM_HEIGHT, 0, ITEM_HEIGHT]);
        const right = interpolate(value, [-1, -0.2, 1], [RIGHT_OFFSET / 2, RIGHT_OFFSET, RIGHT_OFFSET / 3]);

        return {
            transform: [{ translateY }],
            right,
        };
    }, [RIGHT_OFFSET]);

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={require('../assets/testpic.jpg')} // Background Image of Modal
                style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    position: "absolute",
                }}
            />
            <BlurView
                intensity={80}
                tint="dark"
                style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    position: "absolute",
                }}
            />
            <Carousel
                loop={false}
                vertical
                style={{
                    justifyContent: "center",
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                }}
                width={ITEM_WIDTH}
                pagingEnabled={true}
                snapEnabled={true}
                scrollAnimationDuration={500}
                height={ITEM_HEIGHT}
                data = {floors}
                renderItem={({ item, index }) => {
                    const [floor, toilet_uuid] = item; //Destructure the item
                    return (
                        <View key={index} style={{ flex: 1, padding: 10 }}>
                            <View key={index} style={styles.cardContainer}>
                            {toilet_uuid ? (
                                <TouchableOpacity onPress={() => navigation.navigate('Details', { toilet: toilet_uuid })}>
                                    <Text style={styles.floorText}>{floor}</Text>
                                </TouchableOpacity>
                            ) : (
                                // If no toilet_uuid
                                <Text style={styles.floorText}>{floor} [Not avail]</Text>
                            )}
                            </View>
                        </View>
                    );
                }}
                customAnimation={animationStyle}
                scrollAlignmentOffset={0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
    },
    floorText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },

});

export default FloorsCarousel;
