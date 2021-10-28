import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  dataListRef: AngularFireList<any>;
  calibrationListRef: AngularFireList<any>;
  triggersListRef: AngularFireList<any>;
  cmdListRef: AngularFireList<any>;
  triggerRef: AngularFireObject<any>;
  dataRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) { }

  getDataList() {
    this.dataListRef = this.db.list('data');
    return this.dataListRef
  }
  
  getCalibration() {
    this.calibrationListRef = this.db.list('calibration')
    return this.calibrationListRef
  }

  getTriggers(){
    this.triggersListRef = this.db.list('trig')
    return this.triggersListRef
  }

  getData(id:string) {
    this.dataRef = this.db.object('data/'+id);
    return this.dataRef
  }

  addCmd(water: any []) {
    this.cmdListRef = this.db.list('cmd');
    this.cmdListRef.push({
      watering: water,
    })
  }

  updateTrig(trigger: any [], key) {
    this.triggerRef = this.db.object('trig/'+key);
    this.triggerRef.update({
      triggers: trigger,
    })
  }
}
