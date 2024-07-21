import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView} from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from  '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import CardWAction from '../components/CardWAction';
import BarChartCard from '../components/BarChartCard';
import Scrollable from '../components/Scrollable';
import { Button } from 'react-native-paper';


function CleanerDashPage({ route }) {
    const { idToPass } = route.params;
    const idString = idToPass.toString();
    const navigation = useNavigation();
    const [cleanerData, setCleanerData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [errorCount, setErrorCount] = useState(0);
    const [resError, setResError] = useState('See Lifetime');
    const [barChartData, setBarChartData] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });
    const [barChartDataLife, setBarChartDataLife] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });
    const [mainData, setMainData] = useState({
        labels: [],
        datasets: [{ data: [] }]
    });
    const [resErrorCount, setResErrorCount] = useState(0);
    const [cleanerLocation, setCleanerLocation] = useState('');
    const [toilets, setToilets] = useState([]);
    const [assignedLocs, setAssignedLocs] = useState([]);


    const handleSwitch = () => {
        console.log("Switching states!");
        if (mainData === barChartData) {
            setResError("See Monthly")
            setResErrorCount(cleanerData.lifetime_resolve);
            setMainData(barChartDataLife);

        } else {
            setResError("See Lifetime");
            setResErrorCount(cleanerData.toilets_resolved);
            setMainData(barChartData);
        }
    };

    const fetchCleanerData = async () => {
        try{
            const { data, error } = await supabase
                .from("cleaners")
                .select('*')
                .eq('id', idString)
                .single()
            if (error) {
                console.log("Error fetching Cleaner data!", error);
            } else {
                setCleanerData(data);
                setResErrorCount(data.toilets_resolved);
                setCleanerLocation(data.toilets_incharge); // this is a string
                console.log("\n######### Calling fetchCleanerCata: ",cleanerLocation);
                const locs = data.toilets_incharge.split(",").map((item) => item.trim().replace(/^"|"$/g, ''));
                setAssignedLocs(locs);
            }
        } catch (error) {
            console.log("Error with database operation,", error);
        }
    }

    const fetchCleanersData = async () => {
        try{
            const { data, error } = await supabase
                .from("cleaners")
                .select('*')
            if (error) {
                console.log("Error fetching Cleaners data!", error);
            } else {
                const labels = data.map(item => item.id);
                const dataPoints = data.map(item => item.toilets_resolved);
                setBarChartData({
                    labels: labels,
                    datasets: [{ data: dataPoints }]
                });
                const lifetimeDataPoints = data.map(item => item.lifetime_resolve);
                setBarChartDataLife({
                    labels: labels,
                    datasets: [{ data: lifetimeDataPoints }]
                });
                console.log("######## Calling FetchCleanersData for my resolved errors: ", dataPoints)
                console.log("######## fetched lifetime errors too: ", lifetimeDataPoints)
            }
        } catch (error) {
            console.log("Error with database operation,", error);
        }
    }

    const fetchErrors = async () => {
        try{
            const { data, error } = await supabase.
                from("errors")
                .select('*')
            if (error) {
                console.log("Error fetching errors data!", error);
            } else {
                setErrors(data);
                setErrorCount(data.length);
            }
        } catch (error) {
            console.log("Error with database operation,", error);
        }
    };

    const fetchToiletInfo = async () => {
        let allToilets = [];
        for (let filter of assignedLocs) {
            const { data, error } = await supabase
                .from("toilets")
                .select('*')
                .eq('room_name', filter)
                .single();
            if (!error && data) {
                allToilets.push(data);
                console.log("Calling fetchToiletInfo", allToilets);
            } else {
                console.error("Error fetching toilet data!", error);
            }
        }
        setToilets(allToilets);  // Update state once all toilet data is fetched
    };

    // Need to be careful of the fetching of data
    useEffect(() => {
        fetchErrors();
        fetchCleanersData();
        fetchCleanerData();
    }, [idToPass]);

    useEffect(() => {
        if (assignedLocs.length > 0) {
            fetchToiletInfo();
        }
    }, [assignedLocs]);

    useEffect(() => {
        if (Object.keys(cleanerData).length > 0 && barChartData.labels.length > 0) {
            setMainData(barChartData);
        }
    }, [barChartData, cleanerData]);


    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Dashboard</Text>
                </View>
                <View style={styles.welcomeContainer}>
                    <Text>Welcome back Cleaner #{idToPass}! 👋🏻</Text>
                </View>
                <View style={styles.cardContainer}>
                    <View style={styles.cardBox}>
                        <CardWAction
                            buttonText={"Review Errors"}
                            buttonHandler={() => navigation.navigate("Cleaner", { screen:'Resolve', params: { idToPass: idToPass }})}
                            titleText={"Errors Reported"}
                            values={errorCount}
                        />
                    </View>
                    <View style={styles.cardBox}>
                        <CardWAction
                            buttonText={resError}
                            buttonHandler={() => handleSwitch()}
                            titleText={"Errors Resolved"}
                            values={resErrorCount}
                        />
                    </View>
                </View>
                <View >
                    <BarChartCard
                        titleText={"Summary of Peers' KPI"}
                        data={mainData}
                    />
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.header}>Assigned Toilets</Text>
                </View>
                <View style={styles.lineBreak} />
                <View style={{ padding: 5 }}>
                    {toilets.length > 0 ? (
                            <Scrollable toilets={toilets}/>
                        ) : (
                            <Text>Loading toilets information...</Text>
                    )}
                </View>
                <Button title="Home" style={styles.homeButton} mode="outlined" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>Home</Button>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex:1,
        marginTop: 20
    },
    headerContainer: {
        marginTop: 50
    },
    header: {
        fontWeight: 'bold',
        fontSize: 30
    },
    welcomeContainer:{
        marginTop: 5
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20
    },
    cardBox: {
        height: 200,
        flex: 1,
        margin: 10
    },
    lineBreak : {
        marginTop: 5,
        borderBottomColor: 'black',
        borderBottomWidth: '2',
    },
    textBox: {
        marginTop: 20
    },
    buttonContainer: {
        marginTop: 20
    },
    homeButton: {
        marginTop: 20
    },
});

export default CleanerDashPage;
