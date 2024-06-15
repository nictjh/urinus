import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';


function UpdatePage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }


  async function updateProfile(username) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session?.user.id,
        username: username,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) {
        throw error;
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        Alert.alert("Error", "Failed to sign out: " + error.message);
    } else {
        Alert.alert("Signed Out", "You have been signed out successfully.", [
            {
                text: "OK",
                onPress: () => navigation.navigate('Tabs', { screen: 'Home' })
            }
        ]);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={session?.user?.email} disabled placeholder="Disabled" />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={setUsername} />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile(username)}
          disabled={loading}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={handleSignOut}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});


export default UpdatePage;