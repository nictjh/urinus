import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import BarChartComponent from './BarChart';


const screenWidth = Dimensions.get("window").width;

const BarChartCard = ({ titleText, data }) => (
  <Card style={styles.card}>
    <Card.Title title={titleText} titleStyle={styles.cardTitle}/>
    <Card.Content>
      {data && (
        <View style={styles.chartContainer}>
          <BarChartComponent
            data={data}
            width={screenWidth - 80}
          />
        </View>
      )}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
    card: {
      backgroundColor: "#FFFFFF",
      padding: 5,
      marginVertical: 0,
    },
    cardTitle: {
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    valueText: {
        alignSelf: 'center',
        padding: 20,
    },
    chartContainer: {
      marginTop: 20,
    }
});

export default BarChartCard;
