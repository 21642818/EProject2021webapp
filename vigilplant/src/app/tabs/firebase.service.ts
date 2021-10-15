import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  dataListRef: AngularFireList<any>;
  dataRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) { }

  getDataList() {
    this.dataListRef = this.db.list('data');
    return this.dataListRef
  }
  
  getData(id:string) {
    this.dataRef = this.db.object('data/'+id);
    return this.dataRef
  }
}
