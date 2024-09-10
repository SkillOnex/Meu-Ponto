/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)\options` | `/_sitemap` | `/views/AllItemsScreen` | `/views/Options`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
