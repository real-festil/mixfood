import React, { useState } from 'react';
import {
  StyleSheet,
  AsyncStorage,
  Alert,
  View,
  TouchableOpacity,
} from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import { StackActions } from '@react-navigation/native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import Loader from '../components/Loader'
import md5 from 'md5';

const salt = 'mixfood__76sGH';
const currentYear = new Date().getFullYear();

const api_key = md5(currentYear + salt);

const AppleAuthButton = ({ navigation, setHash }) => {

  const [close, setClose] = useState(false);
  const [compact, setCompact] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAppleButtonPress = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const { identityToken, nonce } = appleAuthRequestResponse;

    if (identityToken) {
      const appleCredential = firebase.auth.AppleAuthProvider.credential(identityToken, nonce);
      const userCredential = await firebase.auth().signInWithCredential(appleCredential);

      if (appleAuthRequestResponse.email) {
        registrate(appleAuthRequestResponse.fullName.givenName, appleAuthRequestResponse.email, appleAuthRequestResponse.email);
      } else {
        login(userCredential.additionalUserInfo.profile.email, userCredential.additionalUserInfo.profile.email);
      }
    }
  }

  const login = async (email, password) => {
    setLoading(true);

    const URL = `http://mixfood.ua/api/login?login=${email}&password=${password}&api_key=${api_key}`;
    console.log('URL: ', URL);
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'X-Requested-With': Platform.OS === 'ios' ? 'com.mixfood.ios.app' : 'com.mixfood.app',
          'HTTP_X_REQUESTED_WITH': Platform.OS === 'ios' ? 'com.mixfood.ios.app' : 'com.mixfood.app',
        }
      });
      const json = await response.json();
      console.log('JSON is: ', json);
      if (json?.error) {
        if (json?.message === "Неверный логин или пароль") {
          return Alert.alert("Ошибка авторизации", "Такой email уже используется");
        }
        Alert.alert("Ошибка авторизации", json.message);

      } else {
        AsyncStorage.setItem('authorized', 'Yes');
        AsyncStorage.setItem('hash', json?.gat__mixfood);
      }
    } catch (error) {
      console.log('Error is: ', error);
    } finally {
      setLoading(false);

      navigation.dispatch(
        StackActions.replace('Global')
      );
    }
  };

  const registrate = async (name, email, password) => {
    setLoading(true);
    try {
      const URL = `http://mixfood.ua/api/register?fio=${name}&email=${email}&phone=${email}&password=${password}&api_key=${api_key}`;
      console.log('URL: ', URL);
      const response = await fetch(URL,
        {
          method: 'POST',
          headers: {
            'X-Requested-With': Platform.OS === 'ios' ? 'com.mixfood.ios.app' : 'com.mixfood.app',
            'HTTP_X_REQUESTED_WITH': Platform.OS === 'ios' ? 'com.mixfood.ios.app' : 'com.mixfood.app',
          }
        }
      );
      const json = await response.json();
      console.log('JSON is: ', json);
      if (json?.error) {
        Alert.alert("Ошибка регистрации", json?.message);
      } else {
        AsyncStorage.setItem('authorized', 'Yes');
        AsyncStorage.setItem('hash', json?.gat__mixfood);
      }
    } catch (error) {
      console.log('Error is: ', error);
    } finally {
      setLoading(false);

      navigation.dispatch(
        StackActions.replace('Global')
      );
    }
  };

  return (
    appleAuth.isSupported && !close ? (
      <View style={[styles.container, compact ? {justifyContent: 'space-between'} : {justifyContent: 'space-between'}]}>
        <TouchableOpacity
          style={[
            styles.compactBtn,
            { paddingBottom: 2 },
            compact ? { flex: 1, position: 'relative' } : { minWidth: 60 },
          ]}
          onPress={() => setClose(true)}
          activeOpacity={0.7}
        >
          <EntypoIcon name='cross' size={20} color='white' />
        </TouchableOpacity>

        {
          compact ? null :
            (
              loading ? <Loader cornerRadius={0} /> :
                <AppleButton
                  cornerRadius={10}
                  style={[
                    styles.appleBtn,
                  ]}
                  textStyle={styles.appleBtnTextContainer}
                  buttonStyle={AppleButton.Style.BLACK}
                  buttonType={AppleButton.Type.DEFAULT}
                  onPress={() => onAppleButtonPress()}
                />
            )
        }

        <TouchableOpacity
          style={[
            styles.compactBtn,
            { transform: [{ rotate: compact ? '180deg' : 0 }] },
            compact ? { flex: 1, position: 'relative' } : { minWidth: 60 },
          ]}
          onPress={() => setCompact(!compact)}
          activeOpacity={0.7}
        >
          <AntDesignIcon name='caretdown' size={14} color='white' />
        </TouchableOpacity>

      </View>
    ) : null
  );
};

export default AppleAuthButton;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: 'transparent',
    marginHorizontal: 10,
  },
  appleBtn: {
    height: 48,
    width: 10,
    flex: 1,
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  appleBtnText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '800',
    paddingTop: 3,
  },
  appleBtnTextContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  compactBtn: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    minHeight: 48,
    maxHeight: 48,
    minWidth: 60,
    maxWidth: 60,
    zIndex: 1,
    right: 0,
    borderRadius: 10
  },
});