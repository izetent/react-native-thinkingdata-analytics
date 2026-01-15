import { NativeModules, Platform, type NativeModule } from 'react-native';

type RNThinkingAnalyticsModuleType = NativeModule & Record<string, any>;

const LINKING_ERROR =
  "The package 'react-native-thinkingdata-analytics' doesn't seem to be linked. Make sure:\n\n" +
  (Platform.OS === 'ios' ? "- You have run 'pod install'\n" : '') +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNThinkingAnalyticsModule: RNThinkingAnalyticsModuleType =
  NativeModules.RNThinkingAnalyticsModule ??
  (new Proxy(
    {},
    {
      get(_target: unknown, _prop: string | symbol): never {
        throw new Error(LINKING_ERROR);
      },
    }
  ) as RNThinkingAnalyticsModuleType);

export default RNThinkingAnalyticsModule;
