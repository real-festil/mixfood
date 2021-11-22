import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  AsyncStorage,
  Keyboard,
} from 'react-native';
import { WebView } from 'react-native-webview'
import AppleAuthButton from './components/AppleAuthButton';
import GestureRecognizer from 'react-native-swipe-gestures';
import DeviceInfo from 'react-native-device-info';
import Loader from './components/Loader';

const { height, width } = Dimensions.get('window')
const getCookiesJS = "ReactNativeWebView.postMessage(document.cookie)";

const Global = ({ navigation }) => {
  const webviewRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [hash, setHash] = useState('')
  const [userAgent, setUserAgent] = useState('')
  const [subdomain, setSubdomain] = useState('');
  const [url, setUrl] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const initializeUser = async () => {
    const hash = await AsyncStorage.getItem('hash')
    const subdomain = await AsyncStorage.getItem('subdomain')

    if (hash) {
      setHash(hash);
    }
    if (subdomain) {
      setSubdomain(subdomain)
    }

    setUrl(`https://${subdomain ? subdomain + '.' : ''}mixfood.ua/`)
  }

  const getUserAgent = async () => {
    const userAgent = await DeviceInfo.getUserAgent();
    setUserAgent(userAgent);
  }

  useEffect(() => {
    getUserAgent()
    initializeUser()
    Keyboard.addListener( 'keyboardWillShow', onKeyboardShow );
	  StatusBar.setBarStyle( 'light-content' );
    setDeviceName(DeviceInfo.getDeviceNameSync());
  }, [])

  const onKeyboardShow = () => {
    StatusBar.setBarStyle( 'light-content' );
  }

  const onSwipeLeft = () => {
    if (webviewRef.current) webviewRef.current.goForward()
  }

  const onSwipeRight = () => {
    if (webviewRef.current) webviewRef.current.goBack()
  }

  const _onMessage = (event) => {
    const { data } = event.nativeEvent;
    const cookies = data.split(';');
    let gatExist = false;

    cookies.forEach((cookie) => {
      const c = cookie.trim().split('=');

      if (c[0] === 'gat__mixfood') {
        gatExist = true

        const gat = decodeURIComponent(c[1]);
        setHash(gat);

        if (!hash) {
          AsyncStorage.setItem('hash', gat);
        }
      }

      if (c[0] === 'subdomain') {
        const subdomain = c[1];
        setSubdomain(subdomain)
        AsyncStorage.setItem('subdomain', subdomain);
      }
    });

    if (!gatExist) {
      setHash('');
      AsyncStorage.removeItem('hash');
    }
  }

  // console.log('hash', hash)
  // console.log('subdomain', subdomain)
  console.log('deviceName', DeviceInfo.getDeviceNameSync())

  useEffect(() => {
    webviewRef.current.reload();
  }, [hash, subdomain, userAgent])

  console.log('ref123', webviewRef.current)
  return (
    <GestureRecognizer
      onSwipeLeft={(state) => onSwipeLeft(state)}
      onSwipeRight={(state) => onSwipeRight(state)}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 140
      }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <WebView
          ref={webviewRef}
          autoManageStatusBarEnabled={false}
          style={{ flex: 1 }}
          onLoad={() => setLoading(false)}
          source={{
            uri: `https://${subdomain ? subdomain + '.' : ''}mixfood.ua/`,
            headers: {
              Cookie: hash ? `gat__mixfood=${hash}` : '',
              'X-Requested-With': Platform.OS === 'ios' ? 'com.mixfood.ios.app' : 'com.mixfood.app',
              'HTTP_X_REQUESTED_WITH': Platform.OS === 'ios' ? 'com.mixfood.ios.app' : 'com.mixfood.app',
            },
          }}
          sharedCookiesEnabled
          scrollEnabled
          onLoadStart={(navState) =>
            setUrl(navState.nativeEvent.url)
          }
          cacheEnabled
          userAgent={`Mozilla/5.0 (Linux; Android 4.1.1; ${deviceName}) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19`}
          injectedJavaScript={getCookiesJS}
          containerStyle={{backgroundColor: 'black'}}
          javaScriptEnabled
          onMessage={_onMessage}
          onLoadEnd={() => {
            [10, 50, 100, 500, 1000].forEach(timeout => {
              setTimeout(() => {
                StatusBar.setBarStyle("light-content");
              }, timeout);
            });
          }}
        />

        {
          loading && (
            <View style={{ width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <Loader />
            </View>
          )
        }

        {
          Platform.OS === 'ios' && !hash
            ? <View style={{position: 'absolute', width: '100%', bottom: 15}}><AppleAuthButton navigation={navigation} /></View>
            : null
        }
      </SafeAreaView>
    </GestureRecognizer>
  );
};

export default Global;
