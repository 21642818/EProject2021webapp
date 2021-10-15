import { Component } from '@angular/core';
import { connectListeners } from '@ionic/core/dist/types/utils/overlays';
import { FirebaseService } from '../tabs/firebase.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page{

  dataList: any [];
  lineData: any [];

  constructor(private firebaseApi: FirebaseService) {
    this.fetchData();
  }

  fetchData() {
    let dataRes = this.firebaseApi.getDataList();
    dataRes.snapshotChanges().subscribe(res => {
      let datestampArray = [];
      let resArray = [];
      res.forEach(item => {
        let d = item.payload.val()
        Object.keys(d).map(function(key){
          datestampArray.push(d[key])
          return datestampArray;
        });
      });
      datestampArray.forEach(function(val){
        Object.keys(val).map(function(k){
          //resArray.push(val[k]);
          let timestamp = val[k]["date"]+"T"+val[k]["timestamp"]
          resArray.push(new lineDataSet(timestamp, val[k]["soil_moisture"]))
          return resArray;
        });
      });
      console.log(resArray);
      Promise.resolve(true);
      this.dataList = resArray;
    });    
  }
}

export class lineDataSet {
  timestamp: Date;
  soil_moisture: Number [];

  constructor( timestamp, soil_moisture) {
    this.timestamp = new Date(Date.parse(timestamp));
    this.soil_moisture = soil_moisture;
  }
}

/*
2021-10-09T16:39:45 = 16.405,20.641,18.991,16.719
2021-10-09T17:21:29 = 16.679,20.891,19.37,17.036
2021-10-09T17:51:28 = 16.616,20.91,19.358,16.995
2021-10-09T18:21:28 = 16.577,20.868,19.324,16.93
2021-10-09T18:51:27 = 16.555,20.879,19.359,16.962
2021-10-09T19:30:08 = 16.519,20.817,19.368,17.138
2021-10-09T20:37:48 = 16.495,20.832,19.421,16.782
2021-10-09T21:07:48 = 16.398,20.855,19.438,16.763
2021-10-09T21:37:48 = 16.392,20.841,19.451,16.717
*/