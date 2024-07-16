import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

function CleanerLogin() {
    const navigation = useNavigation();
    const [id, setId] = useState('');

    // Handles one Cleaner ID only, next steps is to populate a cleaner table then pull from there
    function handleSignIn() {
        if (id != "12345") {
            Alert.alert("ID is not recognised");
        } else {
            navigation.navigate('Cleaner', { screen: 'Dashboard', params: { idToPass: id } });
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
            <TextInput
                style={styles.input}
                placeholder="Cleaner ID"
                value={id}
                onChangeText={setId}
                //secureTextEntry
            />
            <Button title="Sign in" style={styles.signInButton} onPress={handleSignIn}/>
            <Button title="Home" style={styles.signInButton} onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />
            </View>
        </View>
        );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    card: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        marginBottom: 15,
        borderRadius: 10,
    },
    signInButton: {
        backgroundColor: '#007BFF',
        color: 'white',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        textAlign: 'center',
    },
});

export default CleanerLogin;
