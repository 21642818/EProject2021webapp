import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* Firebase */
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from 'src/environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

/* Firebase CRUD service */
import { FirebaseService } from './tabs/firebase.service';

/* Reactive Forms */
import { ReactiveFormsModule } from '@angular/forms';

/* OpenCV*/
import { NgOpenCVModule, OpenCVOptions } from 'ng-open-cv';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { ServiceWorkerModule } from '@angular/service-worker';

const openCVConfig: OpenCVOptions = {
  scriptUrl: 'assets/opencv/asm/3.4/opencv.js',
  usingWasm: false,
  onRuntimeInitialized: () => {}
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    AngularFireModule.initializeApp(environment.firebase, 'vigilplant'),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    ReactiveFormsModule,
    NgOpenCVModule.forRoot(openCVConfig),
    provideAuth(() => getAuth()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [FirebaseService, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {
  
}
