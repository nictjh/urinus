import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { setProfileRefresh } from '../global/globVariables';

function LoginPage() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (error) Alert.alert(error.message);
        else {
            // setProfileRefresh(true);
            navigation.navigate('Tabs', { screen: 'Home' })
            setLoading(false)
        };
  };

    return (
    <View style={styles.container}>
        <View style={styles.card}>
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        <Button title="Sign in" onPress={() => signInWithEmail()} />
        <View style={styles.buttonContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Button title="Sign up" onPress={() => navigation.navigate('Signup')} style={styles.signInButton} />
        </View>
        <Button title="Home" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />
        </View>
    </View>
    );
};

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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    signInButton: {
        backgroundColor: '#007BFF',
        color: 'white',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        textAlign: 'center',
    },
    signUpText: {
        marginRight: 5,
    },
});

export default LoginPage;
