import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from '../lib/supabase';
import { Rating } from 'react-native-ratings';
import { getErrorRefresh, setErrorRefresh } from '../global/globVariables.js';
import { usePushNotifications } from '../global/usePushNotification.js';
import { useNavigation } from '@react-navigation/native';
import { TELE_BOT_API, TELE_CHANNEL } from '@env';

function CleanerResPage({ route }) {
    const { idToPass } = route.params;

    const navigation = useNavigation();

    const [errors, setErrors] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [toiletMapping, setToiletMapping] = useState({});

    const { expoPushToken } = usePushNotifications();
    const [refreshStatus, setRefreshStatus] = useState(false); // to poll for new errors

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const fetchErrors = async () => {
        const { data, error } = await supabase
            .from('errors')
            .select('*')
        if (error) {
            console.log("Error fetching errors specific to uuid: ", error);
        } else {
            const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setErrors(sortedData);
        }
    };

    const getToiletMapping = async () => {
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

    const resolveError = async (errorItem) => {
        // Handle resolve error button
        const errorUUID = errorItem.error_uuid;
        const cubUUID = errorItem.cubicle_uuid;
        const errorDesc = errorItem.description;
        const cubNo = errorItem.cubicle_no;
        const toiletUUID = errorItem.toilet_uuid;
        console.log("resolving error with id: " + errorUUID);
        try {
            const { data, error } = await supabase
                .from('errors')
                .delete()
                .match({ error_uuid: errorUUID });

            if (error) {
                throw error;
            }

            console.log('Deleted record:', data);
        } catch (error) {
            console.error('Error deleting error record:', error);
            return null;
        }

        if (cubUUID !== null) {
            try {
                const { data, error } = await supabase
                    .from('cubicles')
                    .update({ status: true })  // Set status to true
                    .match({ cubicle_uuid: cubUUID });  // cubicle_uuid matches the cubUUID

                if (error) {
                    throw error;
                }

                console.log('Cubicle status updated:', data);
            } catch (error) {
                console.error('Error updating cubicle status:', error);
                return null; // or handle the error as needed
            }
        }

        if (errorDesc === "Instant report: Tissue") {
            try {
                const { data, error } = await supabase
                    .from('cubicles')
                    .update({ tissue: true })  // Set status to true
                    .match({ cubicle_uuid: cubUUID });  // cubicle_uuid matches the cubUUID

                if (error) {
                    throw error;
                }

                console.log('Cubicle status updated:', data);
            } catch (error) {
                console.error('Error updating cubicle status:', error);
                return null; // or handle the error as needed
            }
        }

        let notifMessage = `Error resolved :)\n\nError ID: ${errorUUID}`;
        notifMessage += `\nNear: ${toiletMapping[toiletUUID]}`;
        if (cubNo !== null) {
            notifMessage += `\nCubicle No: ${cubNo}`;
        }
        notifMessage += `\nDescription: ${errorDesc}`;
        notifMessage += `\n\nDone by cleaner: ${idToPass}`;
        console.log(notifMessage);
        sendPushNotification(expoPushToken, notifMessage);
        sendTeleMessage(notifMessage);
        setRefreshStatus(true); 
    };


    const sendTeleMessage = async (message) => {
        const encodedMessage = encodeURIComponent(message);
        const parseMode = encodeURIComponent('HTML'); // Tells telegram api the parsing mode to ensure my html blocks get parsed properly
        console.log(TELE_BOT_API, TELE_CHANNEL);
        try {
            const request = await fetch(`https://api.telegram.org/bot${TELE_BOT_API}/sendMessage?chat_id=${TELE_CHANNEL}&text=${encodedMessage}&parse_mode=${parseMode}`, {
                method: 'GET',
                redirect: 'follow'
            });
            const response = await request.json();
            if (!request.ok) {
                console.error('Failed to send message:', response);
            } else {
                console.log("Message sent successfully", response);
            }
            return response;
        } catch (error) {
            console.log("Error sending telegram message", error);
        }
    }

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

    const ErrorCard = ({ errorItem }) => {
        return (
            <View style={styles.errorCard}>
                <View style={styles.errorDetailsContainer}>
                    <Text style={styles.errorTitle}>Error ID: {errorItem.id}</Text>
                    <Text style={styles.errorText}>Time: {new Date(errorItem.created_at).toLocaleString()}</Text>
                    <Text style={styles.errorText}>Near room: {toiletMapping[errorItem.toilet_uuid]}</Text>
                    {errorItem.cubicle_no !== null &&
                        (<Text style={styles.errorText}>Cubicle No: {errorItem.cubicle_no}</Text>)}
                    <Text style={styles.errorText}>Description: {errorItem.description}</Text>
                </View>
                <TouchableOpacity style={styles.resolveButton} onPress={() => {
                    resolveError(errorItem);
                }}>
                    <Text style={styles.resolveButtonText}>Resolve Error</Text>
                </TouchableOpacity>
            </View>
        );
    };


    const refreshFunction = () => {
        const checkValue = getErrorRefresh()
        if (checkValue == true) {
            setRefreshStatus(checkValue)
        }
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshFunction();
        }, 1000);

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []); // this poll for the global variable

    useEffect(() => {
        if (refreshStatus) {
            // When refreshStatus is true this will remount
            console.log("refreshStatus was true, hence remounting")
        }
        setRefreshStatus(false)
        setErrorRefresh(false)
        fetchErrors();
        getToiletMapping();
    }, [refreshStatus]);


    return (
        <View style={styles.outerContainer}>
            <ScrollView style={styles.container}>
                {errors && errors.length > 0 ? (
                    errors.map((errorItem) => (
                        <ErrorCard key={errorItem.id} errorItem={errorItem} />
                    ))
                ) : (
                    <Text style={styles.errorText}>No errors here!</Text>
                )}

            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        marginTop: "8%",
        marginBottom: "3%",
    },
    container: {
        padding: 20,
        flex: 1,
    },
    errorCard: {
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 25,
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
    errorDetailsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignContent: 'flex-start',
    },
    errorTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorText: {
        marginBottom: 5,
        fontSize: 30,
    },
    resolveButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        margin: 5,
    },
    resolveButtonText: {
        color: '#007bff',
        fontSize: 30,
        fontWeight: 'bold',
    },
})


export default CleanerResPage;
