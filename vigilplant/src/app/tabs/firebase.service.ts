import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  dataListRef: AngularFireList<any>;
  dataRef: AngularFireObject<any>;
  cmdRef: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) { }

  getDataList() {
    this.dataListRef = this.db.list('data');
    return this.dataListRef
  }

  getData(id:string) {
    this.dataRef = this.db.object('data/'+id);
    return this.dataRef
  }

  addCmd(water: any [], trigger: any []) {
    this.cmdRef = this.db.list('cmd');
    this.cmdRef.push({
      watering: water,
      triggers: trigger,
    })
  }
}
