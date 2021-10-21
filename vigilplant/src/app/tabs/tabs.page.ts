import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor( private angularFireAuth: AngularFireAuth) {
    this.angularFireAuth.signInWithEmailAndPassword('gerth.mmarais@gmail.com','secret12345')
  }

}
