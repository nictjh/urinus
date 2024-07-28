import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { setProfileRefresh } from '../global/globVariables';

function UpdatePage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [favToilets, setFavToilets] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('profiles')
        .select("*")
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        const toiletNames = data.saved_toilets ? data.saved_toilets.split(',').map(loc => loc.trim()) : [];
        const toiletPromises = toiletNames.map(toiletName => getToiletInfo(toiletName));
        const toiletData = await Promise.all(toiletPromises); // Wait for all toilet data to be fetched
        setFavToilets(toiletData.filter(toilet => toilet !== null));
        console.log(favToilets);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const getToiletInfo = async (toiletName) => {
    try {
      const { data, error } = await supabase
        .from('toilets')
        .select('*')
        .eq('room_name', toiletName)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch data for toilet:', toiletName, error);
      return null;
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
        // setProfileRefresh(true);
        Alert.alert("Signed Out", "You have been signed out successfully.", [
            {
                text: "OK",
                onPress: () => navigation.navigate('Tabs', { screen: 'Home' })
            }
        ]);
    }
  };

  const handleCardPress = (item) => {
    setTimeout(() => {
      navigation.navigate('Details', { marker: item });
    }, 300);
  }

  if (loading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.textBox}>
          <Text style={styles.header}>Favorite Toilets</Text>
      </View>
      <View style={styles.lineBreak} />
      <View>
        {favToilets.map((marker, index) => (
          <TouchableOpacity key={index} onPress={() => handleCardPress(marker)}>
            <View style={styles.card}>
              <Text style={styles.descriptionText}>
                {marker.room_name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.textBox}>
          <Text style={styles.header}>Profile</Text>
      </View>
      <View style={styles.lineBreak} />
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
  textBox: {
    marginTop: 20
  },
  header: {
    fontWeight: 'bold',
    fontSize: 30
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  lineBreak : {
    marginTop: 5,
    borderBottomColor: 'black',
    borderBottomWidth: '2',
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
    fontWeight: 'bold',
  }

});


export default UpdatePage;