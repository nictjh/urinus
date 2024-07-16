import React, { useState, useEffect } from 'react';
import { Button, View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from  '../lib/supabase';

function CleanerResPage({ route }) {
    const { idToPass } = route.params;

    return (
        <View style={styles.container}>
            <Text>Cleaner Res Page {idToPass}</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 50
    },
});


export default CleanerResPage;
