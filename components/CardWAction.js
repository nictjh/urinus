import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

const CardWAction = ({ buttonText, buttonHandler, titleText, values }) => (
  <Card style={styles.card}>
    <Card.Title title={titleText} titleStyle={styles.cardTitle} />
    <Card.Content>
      <Text variant="titleLarge" style={styles.valueText}>{values}</Text>
    </Card.Content>
    <Card.Actions style={styles.cardActions}>
      <Button mode="contained" buttonColor={"#55B7F7"} textColor={"black"} onPress={buttonHandler} style={styles.button}>
        {buttonText}
      </Button>
    </Card.Actions>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  valueText: {
    alignSelf: 'center',
    padding: 20
  },
  cardActions: {
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    alignSelf: 'center'
  }
});

export default CardWAction;
