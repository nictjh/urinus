import React, { useState, useEffect } from 'react';
import { Button, View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from  '../lib/supabase';
import { getGlobalRefresh, setGlobalRefresh } from '../global/globVariables.js';


function AlertPage() {
    const { session } = useAuth();
    const [errors, setErrors] = useState([]);
    const [toiletMapping, setToiletMapping] = useState({});
    const [expanded, setExpanded] = useState(false);
    const [refreshStatus, setRefreshStatus] = useState(false)

    const fetchErrors = async () => {
        try {
            const { data, error, status } = await supabase
                .from('errors')
                .select('*');
            if (error) {
                console.log("Error retreiving error data ", error);
            } else {
                const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setErrors(sortedData);
            }
        } catch (error) {
            console.log("Database error, fail to fetchErrors: ", error);
            setErrors([]);
        }
    };

    const markerMapping = async () => {
        try {
            const {data, error} = await supabase
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

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const refreshFunction = () => {
        const checkValue = getGlobalRefresh()
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
    }, []);

    useEffect(() => {
        if (refreshStatus) {
            console.log("refreshStatus was true, hence remounting")
        }
        setRefreshStatus(false)
        setGlobalRefresh(false)
        fetchErrors();
        markerMapping();
    }, [refreshStatus]);

    return ( // Handle duplicates
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Report Alerts</Text>
            </View>
            <ScrollView style={styles.scrollView}>
                {errors.slice(0, expanded ? errors.length: 3).map((error, index) => (
                    <View key={index} style={styles.card}>
                    <Text style={styles.descriptionText}>
                        "{error.description}" was reported for <Text style={styles.contactHeaders}>Cubicle {error.cubicle_no}</Text>
                        , near
                        <Text style={styles.contactHeaders}> {toiletMapping[error.toilet_uuid]}</Text>
                    </Text>
                        <Text style={styles.dateText}>{new Date(error.created_at).toLocaleString()}</Text>
                    </View>
                ))}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity onPress={toggleExpanded}>
                        <Text>{expanded ? "Hide" : "Show All Reports"}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.contactContainer}>
                    <Text style={styles.contactHeaders}>Contact Us</Text>
                    <Text>
                        <Text style={styles.blueHighlight}>@+65 6601 7878</Text>
                        , NUS Campus Life
                    </Text>
                    <Text>nicholastok0101@gmail.com</Text>
                    <Text>bryanchew22@gmail.com</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    scrollView: {
        paddingHorizontal: 20,
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
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        alignSelf: 'flex-start',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 20,
        marginTop: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    descriptionText: {
        fontSize: 16,
        color: 'black',
    },
    dateText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'right',
        paddingTop: 10
    },
    toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    },
    toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    },
    contactContainer: {
    paddingTop: 40
    },
    contactHeaders: {
    fontWeight: 'bold'
    },
    blueHighlight: {
    color: 'blue',
    fontWeight: 'bold'
    }
})


export default AlertPage;