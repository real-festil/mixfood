import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  StatusBar,
  Platform,
  Text,
  SafeAreaView
} from 'react-native';
import Global from './Global'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator initialRouteName='Global'>
      <Stack.Screen name="Global" component={Global} options={{
        header: () => null
      }} />
    </Stack.Navigator>
  );
}

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} barStyle="light-content" {...props} />
    </SafeAreaView>
  </View>
);

const App = () => (
  <NavigationContainer>
    <MyStatusBar backgroundColor="#221b1c" barStyle="light-content" />
    <MyStack />
  </NavigationContainer>
);

export default App;

class DarkTheme extends Component {
  render() {
    return (
      <View style={styles.container}>
        <MyStatusBar backgroundColor="#221b1c" barStyle="dark-content" />
        <View style={styles.appBar} />
        <View style={styles.content} />
      </View>
    );
  }
}

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
    color: '#fff'
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
    color: '#fff'
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
    color: '#fff'
  },
});

AppRegistry.registerComponent('App', () => DarkTheme);
