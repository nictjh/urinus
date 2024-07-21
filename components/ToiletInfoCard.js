import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ToiletInfoCard = ({ toilet }) => {
    const navigation = useNavigation();

    // const roomCode = toilet.room_code ? toilet.room_code : "undefined";
    return (
        <View style={styles.container}>
            <Card>
                <Card.Cover source={require('../assets/testpic.jpg')} style={styles.picture} />
                <Card.Content>
                    <Text variant="titleLarge" style={styles.location}>{toilet.room_name}</Text>
                    <Text variant="bodyMedium">Located in {toilet.room_code}</Text>
                </Card.Content>
                <Card.Actions>
                    <Button onPress={() => navigation.navigate('Details', { marker: toilet })}>See More</Button>
                </Card.Actions>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    picture: {
        padding: 5,
        height: 150
    },
    location: {
        fontSize: 20,
        fontWeight: 'bold'
    }
});

export default ToiletInfoCard;
