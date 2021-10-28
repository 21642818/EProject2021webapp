import { Component, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FirebaseService } from '../tabs/firebase.service';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import cv from "../../assets/js/opencv.js"

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  @ViewChild("valueLineCanvas") valueLinesCanvas
  @ViewChild("valueLineCanvasTempHumid") valueTempHumid
  @ViewChild("submitWater") submitWater
  valueLinesChart: any;
  valueTempHumidChart: any;
  chartData = null;

  tempList: any [];
  humidList: any [];
  calibrationMax: any [];
  calibrationMin: any [];

  dataList: any [];
  imagePaths: any[];
  imageRef: any;
  imageRefTimeStamp: any;
  firstDate: any;
  pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  defaultImg = '../assets/default-img.jpg'

  sliderOpts = {
    zoom: false,
    slidesPerView: 1.1,
    centredSlides: true,
    spaceBetween: 10,
  }

  constructor(private firebaseApi: FirebaseService, private fbStorage: AngularFireStorage) {
    this.fetchData();
  }

  ionViewDidLoad() {
    this.fetchData()
  }

  oneDay(){
    this.setDate(1);
  }

  fiveDays(){
    this.setDate(5);
  }

  sevenDays(){
    this.setDate(7);
  }

  oneWeek(){
    this.setDate(14);
  }

  oneMonth(){
    this.setDate(30);
  }

  setDate(daterange: number) {
    this.pastDate = new Date(Date.now() - daterange * 24 * 60 * 60 * 1000)
    if (this.pastDate < this.firstDate) {
      this.pastDate = this.firstDate
    }
    this.updateCharts(this.dataList)
  }

  fetchData() {
    let calibrationRes = this.firebaseApi.getCalibration();
    calibrationRes.snapshotChanges().subscribe(res => {
      let resSize = res.length-1
      this.calibrationMax = res[resSize].payload.val()['max'];
      this.calibrationMin = res[resSize].payload.val()['min'];
    })
    var lastImagePath: any;
    var lastImageStamp: any;
    let dataRes = this.firebaseApi.getDataList();
    dataRes.snapshotChanges().subscribe(res => {
      let datestampArray = [];
      let resArray = [];
      let tList = [];
      let hList = [];
      res.forEach(item => {
        let d = item.payload.val()
        Object.keys(d).map(function(key){
          datestampArray.push(d[key])
          return datestampArray;
        });
      });
      datestampArray.forEach((val)=>{
        Object.keys(val).map((k)=>{
          let timestamp = val[k]["date"]+"T"+val[k]["timestamp"]
          let soilArr = val[k]["soil_moisture"];
          for (let index = 0; index < soilArr.length; index++) {
            let value = soilArr[index];
            let newValue = 100*(value)/(this.calibrationMax[index]- +this.calibrationMin[index])
            if (newValue > 100) {
              newValue = 100.0;
            } else if (newValue < 0) {
              newValue = 0.0;
            };
            soilArr[index] = newValue;
          }
          resArray.push(new lineDataSet(timestamp,soilArr))
          let prev_ImagePath = val[k]['img_path']
          if (prev_ImagePath != null) {
            lastImagePath = val[k]['img_path'];
            lastImageStamp = timestamp;
          }
          tList.push(val[k]["temp_humid"][0]);
          hList.push(val[k]["temp_humid"][1]);
          return resArray;
        });
      });
      this.firstDate = resArray[0].timestamp
      this.tempList = tList;
      this.humidList = hList;
      if (this.chartData) {
        this.updateCharts(resArray)
      } else {
        this.createCharts(resArray)
      }
      this.dataList = resArray;
      this.imageRef = this.fbStorage.ref("/"+lastImagePath).getDownloadURL();
      this.imageRefTimeStamp = new Date(lastImageStamp).toLocaleString('en-ZA');
    });    
  }

  chartHidden(){
    if (this.valueLinesChart != undefined){
      //console.log(!this.valueLinesChart.data.datasets[4].hidden)
    }
  }

  getReportValue(num){
    let reportValue = []
    
    for (let trans of this.chartData) {
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
    let chartData5 = this.tempList;
    let chartData6 = this.humidList;

    // Create the chart
    this.valueLinesChart = new Chart(this.valueLinesCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [
          {
            label: "Soil Sensor 1",
            data: chartData1,
            fill: false,
            animation:false,
            pointRadius: 2,
            borderColor: '#ef476f',
            backgroundColor: '#ef476f',
            yAxisID: 'y',
          },
          {
            label: "Soil Sensor 2",
            data: chartData2,
            fill: false,
            animation:false,
            pointRadius: 2,
            borderColor: '#ffd166',
            backgroundColor: '#ffd166',
            yAxisID: 'y',
          },
          {
            label: "Soil Sensor 3",
            data: chartData3,
            fill: false,
            animation:false,
            pointRadius: 2,
            borderColor: '#06d6a0',
            backgroundColor: '#06d6a0',
            yAxisID: 'y',
          },
          {
            label: "Soil Sensor 4",
            data: chartData4,
            fill: false,
            animation:false,
            pointRadius: 2,
            borderColor: '#118ab2',
            backgroundColor: '#118ab2',
            yAxisID: 'y',
          },
          {
            label: "Temperature",
            data: chartData5,
            fill: true,
            pointRadius: 2,
            borderColor: 'rgb(253, 32, 192, 0.8)',
            backgroundColor: 'rgb(253, 32, 192, 0.1)',
            yAxisID: 'y1',
            hidden: true,
          },
          {
            label: "Humidity",
            data: chartData6,
            fill: true,
            pointRadius: 2,
            borderColor: 'rgb(233, 229, 245, 0.8)',
            backgroundColor: 'rgb(233, 229, 245, 0.1)',
            yAxisID: 'y2',
            hidden: true,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true
          },
          decimation: {
            enabled: true,
            algorithm: 'min-max',
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
            },
            min: this.pastDate.valueOf()
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
          },
          y1: {
            type: 'linear',
            display: false,
            position: 'right',
            grid: {
              drawOnChartArea: false, 
            },
            ticks: {
              callback: function(value, index, values) {
                  return value + '°C';
              }
            },
          },
          y2: {
            type: 'linear',
            display: false,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value, index, values) {
                  return value + '%';
              }
            }
          }
        },
        elements:{
          point:{
            radius:0,
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 3,
        spanGaps: true,
      },
    })
    this.valueTempHumidChart = new Chart(this.valueTempHumid.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [
          {
            label: "Temperature",
            data: chartData5,
            fill: true,
            pointRadius: 2,
            borderColor: '#ef24c3',
            backgroundColor: 'rgb(253, 32, 192, 0.1)',
            yAxisID: 'y',
          },
          {
            label: "Humidity",
            data: chartData6,
            fill: true,
            pointRadius: 2,
            borderColor: '#e8e5f6',
            backgroundColor: 'rgb(233, 229, 245, 0.1)',
            yAxisID: 'y1',
          },
        ]
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
            min: this.pastDate.valueOf()
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            suggestedMin:11,
            ticks: {
              callback: function(value, index, values) {
                  return value + '°C';
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false, 
            },
            ticks: {
              callback: function(value, index, values) {
                  return value + '%';
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 3,
        spanGaps: true
      },
      
    })
  }
  updateCharts(data: any) {
    this.chartData = data;
    
    let chartData1 = this.getReportValue(0);
    let chartData2 = this.getReportValue(1);
    let chartData3 = this.getReportValue(2);
    let chartData4 = this.getReportValue(3);
    let chartData5 = this.tempList;
    let chartData6 = this.humidList;
    let chartDataList = [chartData1, chartData2, chartData3, chartData4];
    let chartTempHumidList = [chartData5, chartData6];
    let labelData = this.getLabelValue();
    // Update our dataset
    for (let index = 0; index < 4; index++) {
      this.valueLinesChart.data.datasets[index].data = chartDataList[index]   
    }
    for (let index = 0; index < 2; index++) {
      this.valueTempHumidChart.data.datasets[index].data = chartTempHumidList[index]
    }
    this.valueLinesChart.options.scales.x.min = this.pastDate.valueOf();
    this.valueTempHumidChart.options.scales.x.min = this.pastDate.valueOf();
    this.valueLinesChart.data.labels = labelData;
    this.valueTempHumidChart.data.labels = labelData;
    this.valueLinesChart.update();
    this.valueTempHumidChart.update();
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
