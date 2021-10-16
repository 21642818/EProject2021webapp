import { Component, ViewChild } from '@angular/core';
import { FirebaseService } from '../tabs/firebase.service';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild("valueLineCanvas") valueLinesCanvas
  @ViewChild("submitWater") submitWater
  valueLinesChart: any;
  chartData = null;

  dataList: any [];

  constructor(private firebaseApi: FirebaseService) {
    this.fetchData();
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
    let chartData2 = this.getReportValue(1);
    let chartData3 = this.getReportValue(2);
    let chartData4 = this.getReportValue(3);

    // Create the chart
    this.valueLinesChart = new Chart(this.valueLinesCanvas.nativeElement, {
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
        },
        {
          label: "Soil Sensor 2",
          data: chartData2,
          fill: false,
          pointRadius: 0,
          borderColor: '#ffd166',
          backgroundColor: '#ffd166',
          tension: 0.5
        },
        {
          label: "Soil Sensor 3",
          data: chartData3,
          fill: false,
          pointRadius: 0,
          borderColor: '#06d6a0',
          backgroundColor: '#06d6a0',
          tension: 0.5
        },
        {
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
            display: true
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
            },
          }
        },
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
      },
    })
  }
  updateCharts(data: any) {
    this.chartData = data;
    let chartData1 = this.getReportValue(0);
    let chartData2 = this.getReportValue(1);
    let chartData3 = this.getReportValue(2);
    let chartData4 = this.getReportValue(3);
    let labelData = this.getLabelValue();
    // Update our dataset
    
    this.valueLinesChart.data.datasets[0] = chartData1;
    this.valueLinesChart.data.datasets[1] = chartData2;
    this.valueLinesChart.data.datasets[2] = chartData3;
    this.valueLinesChart.data.datasets[3] = chartData4;
    this.valueLinesChart.data.labels = labelData;
    this.valueLinesChart.update();
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
