import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../screens/AuthContext';


function ReviewPage() {
    const { session } = useAuth();
    
    return (
        <View>
            <Text>Review Page</Text>
        </View>
    );
};

export default ReviewPage;
