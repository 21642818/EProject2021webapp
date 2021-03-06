// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { FirebaseOptions } from '@firebase/app';

export const environment = {
  production: false,
  firebase: {
    projectId: 'eproject2021-555cc',
    appId: '1:150909878366:web:179d1efd18fa8ef042b4cf',
    databaseURL: 'https://eproject2021-555cc-default-rtdb.europe-west1.firebasedatabase.app',
    storageBucket: 'eproject2021-555cc.appspot.com',
    locationId: 'europe-west',
    apiKey: 'AIzaSyBv903hPYzxzEycZrP-MRhsg9P-5OwUG7k',
    authDomain: 'eproject2021-555cc.firebaseapp.com',
    messagingSenderId: '150909878366',
    measurementId: 'G-BP5VDN1RYH',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
