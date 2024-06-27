import React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { useAuth } from '../screens/AuthContext';
import { supabase } from  '../lib/supabase';


function CardsPage() {
    const { session } = useAuth();

    return (
        <View style={styles.container}>
            <Text>Cards Page</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop:50
    }
})


export default CardsPage;
