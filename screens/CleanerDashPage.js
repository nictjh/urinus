import React, { useState, useEffect } from 'react';
import { Button, View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from  '../lib/supabase';
import { useNavigation } from '@react-navigation/native'

function CleanerDashPage({ route }) {
    const { idToPass } = route.params;
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text>CleanerDashBOARD {idToPass}</Text>
            <Button title='Resolve' onPress={() => navigation.navigate("Cleaner", { screen:'Resolve', params: { idToPass: idToPass } })}/>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 50
    },
});

export default CleanerDashPage;
