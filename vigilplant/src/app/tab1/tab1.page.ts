import { Component, ViewChild, OnInit } from '@angular/core';
import { FirebaseService } from '../tabs/firebase.service';
import { ViewDidEnter } from '@ionic/angular';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import annotationPlugin from 'chartjs-plugin-annotation';
import { FormBuilder, FormGroup} from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public wateringForm: FormGroup; 
  public triggerForm: FormGroup;  
  public waterButtonDisabled : boolean;

  @ViewChild("valueLineCanvas1") valueLinesCanvas1
  @ViewChild("valueLineCanvas2") valueLinesCanvas2
  @ViewChild("valueLineCanvas3") valueLinesCanvas3
  @ViewChild("valueLineCanvas4") valueLinesCanvas4
  @ViewChild("submitWater") submitWater
  @ViewChild("checkboxWater") checkboxWater
  @ViewChild('rangeVal1') rangeVal1
  valueLinesChart1: any;
  valueLinesChart2: any;
  valueLinesChart3: any;
  valueLinesChart4: any;
  chartData = null;

  dataList: any [];
  triggersList: any [];
  triggersKey: any;
  calibrationMax: any [];
  calibrationMin: any [];

  firstDate: any;
  pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  constructor(private firebaseApi: FirebaseService, public fb: FormBuilder, private alertController: AlertController) {
    Chart.register(annotationPlugin);
    this.fetchData();
    this.waterForm();
    this.trigForm();
  }

  waterForm(){
    this.wateringForm = this.fb.group({
      plant1: [],
      plant2: [],
      plant3: [],
      plant4: [],
    })
  }

  trigForm(){
    if (this.triggersList == undefined) {
      this.triggerForm = this.fb.group({
        rangeValue1: 0,
        rangeValue2: 0,
        rangeValue3: 0,
        rangeValue4: 0,
      })
    } else {
      this.triggerForm.patchValue({
        rangeValue1: this.triggersList[0],
        rangeValue2: this.triggersList[1],
        rangeValue3: this.triggersList[2],
        rangeValue4: this.triggersList[3],
      })
    }    
  }

  trigValchange() {
    let tempTrigList = [];
    Object.keys(this.triggerForm.value).map(key =>{
      tempTrigList.push(this.triggerForm.value[key])
    }) 
    this.triggersList = tempTrigList;
    if (this.chartData != undefined) {
      this.updateChartAnnotations()  
    }
  }

  resetForm(){
    this.wateringForm.reset()
  }

  submitCmd() {
    this.waterButtonDisabled = true;
    let wateringArr = [];
    let wateringDict = this.wateringForm.value
    Object.keys(wateringDict).map(function(val){
      if (wateringDict[val]) {
        wateringArr.push(1)
      } else {
        wateringArr.push(0)
      }
    })
    this.firebaseApi.addCmd(wateringArr)
    this.resetForm()
    setTimeout(() => {
      this.waterButtonDisabled = false;
    }, 30000)
  }

  submitTrig(){
    let tempTrigList = [];
    if (this.triggersList != undefined){
      for (let index = 0; index < 4; index++) {
        tempTrigList.push(Math.ceil(1000*((this.triggersList[index]/100)*(this.calibrationMax[index]- +this.calibrationMin[index])))/1000)
      }
      try {
        this.firebaseApi.updateTrig(tempTrigList, this.triggersKey)
        this.presentAlert()
      } catch (error) {
       console.log(error) 
      }
    }
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
  
  maxTime(){
    this.setDate(-1);
  }

  setDate(daterange: number) {
    if (daterange > 0) {
      this.pastDate = new Date(Date.now() - daterange * 24 * 60 * 60 * 1000)
      if (this.pastDate < this.firstDate) {
        this.pastDate = this.firstDate
      }
    } else {
      this.pastDate = this.firstDate
    }

    this.updateCharts(this.chartData)
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      //cssClass: '',
      header: 'Success',
      //subHeader: 'Subtitle',
      message: 'Triggers have been updated',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  fetchData() {
    let calibrationRes = this.firebaseApi.getCalibration();
    calibrationRes.snapshotChanges().subscribe(res => {
      let resSize = res.length-1
      this.calibrationMax = res[resSize].payload.val()['max'];
      this.calibrationMin = res[resSize].payload.val()['min'];
    })
    let triggersRes = this.firebaseApi.getTriggers();
    triggersRes.snapshotChanges().subscribe(res => {
      let resSize = res.length-1
      this.triggersList = res[resSize].payload.val()['triggers'];
      let tempTrigList = []
      if (this.triggersList != undefined){
        for (let index = 0; index < 4; index++) {
          tempTrigList.push(Math.floor(100*(this.triggersList[index])/(this.calibrationMax[index]- +this.calibrationMin[index])))
        }
        this.triggersList = tempTrigList  
      }
      this.triggersKey=res[resSize].key
      this.trigForm();
    })
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
      datestampArray.forEach((val) => {
        Object.keys(val).map((k) => {
          //resArray.push(val[k]);
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
          resArray.push(new lineDataSet(timestamp,soilArr));
          return resArray;
        });
      });
      this.dataList = resArray;
      this.firstDate = resArray[0].timestamp
      if (this.chartData) {
        this.updateCharts(resArray)
      } else {
        this.createCharts(resArray)
      }
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
    this.valueLinesChart1 = new Chart(this.valueLinesCanvas1.nativeElement, {
      type: 'line',
      data: {
        labels: chartLabel,
        datasets: [
          {
          label: "Soil Sensor 1",
          data: chartData1,
          fill: true,
          pointRadius: 0,
          borderColor: 'rgb(239, 71, 111, 1)',
          backgroundColor: 'rgb(239, 71, 111, 0.2)',
          tension: 0.5
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          annotation: {
            annotations:{
              line: {
                type: 'line',
                yMax:this.triggersList[0],
                yMin:this.triggersList[0],
                borderColor: 'rgb(239, 71, 111, 1)',
                borderWidth: 2,
              }
            }
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: 'day',
              minUnit: 'hour',
              stepSize: 1,
            },
            min: this.pastDate.valueOf()
          },
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
          fill: true,
          pointRadius: 0,
          borderColor: 'rgb(255, 209, 102, 1)',
          backgroundColor: 'rgb(255, 209, 102, 0.2)',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          annotation: {
            annotations:{
              line: {
                type: 'line',
                yMax:this.triggersList[1],
                yMin:this.triggersList[1],
                borderColor: 'rgb(255, 209, 102, 1)',
                borderWidth: 2,
              }
            }
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
          fill: true,
          pointRadius: 0,
          borderColor: 'rgb(6, 214, 160, 1)',
          backgroundColor: 'rgb(6, 214, 160, 0.2)',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          annotation: {
            annotations:{
              line: {
                type: 'line',
                yMax:this.triggersList[2],
                yMin:this.triggersList[2],
                borderColor: 'rgb(6, 214, 160, 1)',
                borderWidth: 2,
              }
            }
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
          fill: true,
          pointRadius: 0,
          borderColor: 'rgb(17, 138, 178, 1)',
          backgroundColor: 'rgb(17, 138, 178, 0.2)',
          tension: 0.5
        },],
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          annotation: {
            annotations:{
              line: {
                type: 'line',
                yMax:this.triggersList[3],
                yMin:this.triggersList[3],
                borderColor: 'rgb(17, 138, 178, 1)',
                borderWidth: 2,
              }
            }
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
        },
        responsive: true,
        maintainAspectRatio: false,
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
    this.valueLinesChart1.data.datasets.forEach((dataset) => {
      dataset.data = chartData1
    });
    this.valueLinesChart2.data.datasets.forEach((dataset) => {
      dataset.data = chartData2
    });
    this.valueLinesChart3.data.datasets.forEach((dataset) => {
      dataset.data = chartData3
    });
    this.valueLinesChart4.data.datasets.forEach((dataset) => {
      dataset.data = chartData4
    });
    this.valueLinesChart1.options.scales.x.min = this.pastDate.valueOf();
    this.valueLinesChart2.options.scales.x.min = this.pastDate.valueOf();
    this.valueLinesChart3.options.scales.x.min = this.pastDate.valueOf();
    this.valueLinesChart4.options.scales.x.min = this.pastDate.valueOf();
    this.valueLinesChart1.data.labels = labelData;
    this.valueLinesChart1.update();
    this.valueLinesChart2.data.labels = labelData;
    this.valueLinesChart2.update();
    this.valueLinesChart3.data.labels = labelData;
    this.valueLinesChart3.update();
    this.valueLinesChart4.data.labels = labelData;
    this.valueLinesChart4.update();
  }

  updateChartAnnotations(){
    this.valueLinesChart1.options.plugins.annotation.annotations.line.yMax = this.triggersList[0]
    this.valueLinesChart1.options.plugins.annotation.annotations.line.yMin = this.triggersList[0]
    this.valueLinesChart1.update();
    this.valueLinesChart2.options.plugins.annotation.annotations.line.yMax = this.triggersList[1]
    this.valueLinesChart2.options.plugins.annotation.annotations.line.yMin = this.triggersList[1]
    this.valueLinesChart2.update();
    this.valueLinesChart3.options.plugins.annotation.annotations.line.yMax = this.triggersList[2]
    this.valueLinesChart3.options.plugins.annotation.annotations.line.yMin = this.triggersList[2]
    this.valueLinesChart3.update();
    this.valueLinesChart4.options.plugins.annotation.annotations.line.yMax = this.triggersList[3]
    this.valueLinesChart4.options.plugins.annotation.annotations.line.yMin = this.triggersList[3]
    this.valueLinesChart4.update();
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