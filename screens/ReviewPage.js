import React from 'react';
import { Button, View, Text } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from  '../lib/supabase';
// const markerFile =  require('../markers.json');

function ReviewPage() {
    const { session } = useAuth();

    return (
        <View>
            <Text>Review Page</Text>
        </View>
    );
};

// add markers to supabase
// Not in use after insert!
async function addMarkers(jsonFile) {
    // Transforming data to input into db
    const filterForCom = jsonFile.filter((room) => room.roomCode.includes("COM"));
    const transformedData = filterForCom.map((room) => ({
        roomcode: room.roomCode,
        roomname: room.roomName,
        floor: room.floor,
        longitude: room.coordinate.longitude,
        latitude: room.coordinate.latitude
    }));
    // console.log(transformedData);

    // Inserting into database
    try {
        const { data, error, status } = await supabase
            .from('venues')
            .insert(transformedData);

        if (error) {
            console.error("Error inserting data", error);
        } else {
            console.log("Successfully inserted");
        }
    } catch (error) {
        console.error("Error with database operation", error);
    }
}

export default ReviewPage;
