import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Alert, Image } from 'react-native';

function DetailsScreen({ route, navigation }) {
    const { marker } = route.params;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details for {marker.room_name}</Text>
      </View>
    );
}

export default DetailsScreen;
