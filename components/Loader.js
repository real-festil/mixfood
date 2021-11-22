import React from "react";
import { ActivityIndicator, StyleSheet, View, Text, Image } from "react-native";

const Indicator = ({ cornerRadius }) => (
  <View style={[styles.container, styles.horizontal, { borderRadius: cornerRadius }]}>
    <Image source={require('../assets/apploader.gif')} />
  </View>
);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
  },
  horizontal: {
  }
});

export default Indicator;