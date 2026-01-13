import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  "The package 'react-native-thinkingdata-analytics' doesn't seem to be linked. Make sure:\n\n" +
  (Platform.OS === 'ios' ? "- You have run 'pod install'\n" : '') +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNThinkingAnalyticsModule = NativeModules.RNThinkingAnalyticsModule
  ? NativeModules.RNThinkingAnalyticsModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export default RNThinkingAnalyticsModule;
