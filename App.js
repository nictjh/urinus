import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}





// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Trial Urinus setup</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }


// // Styling section, can either be referenced here or done directly
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
