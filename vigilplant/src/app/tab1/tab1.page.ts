import { Component, ViewChild } from '@angular/core';
import { connectListeners } from '@ionic/core/dist/types/utils/overlays';
import { FirebaseService } from '../tabs/firebase.service';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import {DateTime} from 'luxon';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page{
  public waterForm = [   
    { val: 'Plant 1' , isChecked: true},  
    { val: 'Plant 2' , isChecked: true},  
    { val: 'Plant 3' , isChecked: true},  
    { val: 'Plant 4' , isChecked: true}  
  ];  

  @ViewChild("valueLineCanvas1") valueLinesCanvas1
  @ViewChild("valueLineCanvas2") valueLinesCanvas2
  @ViewChild("valueLineCanvas3") valueLinesCanvas3
  @ViewChild("valueLineCanvas4") valueLinesCanvas4
  valueLinesChart1: any;
  valueLinesChart2: any;
  valueLinesChart3: any;
  valueLinesChart4: any;
  chartData = null;

  dataList: any [];

  constructor(private firebaseApi: FirebaseService) {
    this.fetchData();
  }

  waterCmd(event?: MouseEvent) {
    if (event) { 
      event.stopPropagation();
      console.log(this.dataList);
    }
    
  }

  ionViewDidLoad() {
    this.fetchData()
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
          resArray.push(new lineDataSet(timestamp,val[k]["soil_moisture"]))
          return resArray;
        });
      });
      //console.log(resArray);
      if (this.chartData) {
        this.updateCharts(resArray)
      } else {
        this.createCharts(resArray)
      }
      this.dataList = resArray;
    });    
  }

  getReportValue(num){
    let reportValue = []
    
    for (let trans of this.chartData) {
      //console.log(trans)
      reportValue.push(trans.soil_moisture[num])
    }
    
    return reportValue
  }

  getLabelValue() {
    let labelValue = []
    
    for (let trans of this.chartData) {
      labelValue.push(trans.timestamp)
    }
    return labelValue
  }

  createCharts(data: any){
    this.chartData = data;

    let chartLabel = this.getLabelValue();
    let chartData1 = this.getReportValue(0);
    console.log(chartData1);
    let chartData2 = this.getReportValue(1);
    let chartData3 = this.getReportValue(2);
    let chartData4 = this.getReportValue(3);

    // Create the chart
    this.valueLinesChart1 = new Chart(this.valueLinesCanvas1.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [{
          label: "Soil Sensor 1",
          data: chartData1,
          fill: false,
          pointRadius: 0,
          borderColor: '#ef476f',
          backgroundColor: '#ef476f',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    })
    this.valueLinesChart2 = new Chart(this.valueLinesCanvas2.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [{
          label: "Soil Sensor 2",
          data: chartData2,
          fill: false,
          pointRadius: 0,
          borderColor: '#ffd166',
          backgroundColor: '#ffd166',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    })
    this.valueLinesChart3 = new Chart(this.valueLinesCanvas3.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [{
          label: "Soil Sensor 3",
          data: chartData3,
          fill: false,
          pointRadius: 0,
          borderColor: '#06d6a0',
          backgroundColor: '#06d6a0',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    })
    this.valueLinesChart4 = new Chart(this.valueLinesCanvas4.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [{
          label: "Soil Sensor 4",
          data: chartData4,
          fill: false,
          pointRadius: 0,
          borderColor: '#118ab2',
          backgroundColor: '#118ab2',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }
  updateCharts(data: any) {
    this.chartData = data;
    let chartData1 = this.getReportValue(0);
    let labelData = this.getLabelValue();
    // Update our dataset
    this.valueLinesChart1.data.datasets.forEach((dataset) => {
      dataset.data = chartData1
    });
    this.valueLinesChart1.data.labels = labelData;
    this.valueLinesChart1.update();
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