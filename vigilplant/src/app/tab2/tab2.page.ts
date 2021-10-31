import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FirebaseService } from '../tabs/firebase.service';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import { Observable } from 'rxjs';
import { NgOpenCVService, OpenCVLoadResult } from 'ng-open-cv';
import * as colormap from 'colormap'
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page{
  @ViewChild("valueLineCanvas") valueLinesCanvas
  @ViewChild("valueLineCanvasTempHumid") valueTempHumid
  @ViewChild("imgStatic") imgStatic
  @ViewChild("imgTimeLapse") imgTimeLapse
  @ViewChild("variCanvas") variCanvas
  @ViewChild("progress") progressLabel
  variCxt: CanvasRenderingContext2D

  valueLinesChart: any;
  valueTempHumidChart: any;
  chartData = null;

  tempList: any [];
  humidList: any [];
  calibrationMax: any [];
  calibrationMin: any [];

  dataList: any [];
  imagePaths: any[];
  imageLink: any;
  imageRefTimeStamp: any;
  firstDate: any;
  pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  defaultImg = '../assets/default-img.jpg'
  openCVLoadResult: Observable<OpenCVLoadResult>;
  imgProcProgress = 0;
  imgHeight = 2464;
  imgWidth = 3280;
  imgCollection: any [];
  public playButtonDisabled : boolean = true;
  

  sliderOpts = {
    zoom: false,
    slidesPerView: 1.1,
    centredSlides: true,
    spaceBetween: 10,
  }

  constructor(private firebaseApi: FirebaseService, private fbStorage: AngularFireStorage, 
      private ngOpenCVService: NgOpenCVService, private alertController: AlertController) {
    this.fetchData();
    this.playButtonDisabled = true
  }

  ngOnInit() {
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

  twoWeeks(){
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

  takePicture() {
    this.imgTimeLapse.nativeElement.hidden=true
    this.imgStatic.nativeElement.hidden=false
    console.log('click')
  }

  async createTimelapse(){
    console.log('timelapse')
    let imgCollection = []
    for (let trans of this.chartData.reverse()) {
      if (trans.timestamp < this.pastDate) {
        break
      }
      if (trans.imgPath != null) {
        try {
          await this.fbStorage.ref("/"+trans.imgPath).getDownloadURL().forEach( async val => {
            let imgSrc: any;
            imgSrc = await this.getBase64ImageFromUrl(val)
            imgCollection.push({
              time: trans.timestamp,
              img: imgSrc
            })
          })          
        } catch (error) {
          console.log(error)
        } 
      }
    }
    this.imgCollection=imgCollection;
    //console.log(imgCollection)
    //var plantCollection = ee.ImageCollection(imgCollection)
    this.timelapseCreatedAlert()
    this.playButtonDisabled = false
    //console.log(this.imgStatic.nativeElement.hidden)
  }

  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
 
    return new Promise((resolve, reject) => {
       var reader = new FileReader();
       reader.addEventListener("load", function() {
          resolve(reader.result);
       }, false);
 
       reader.onerror = () => {
          return reject(this);
       };
       reader.readAsDataURL(blob);
    })
  }

  startSlideshow(){
    let temp = this.imageRefTimeStamp
    this.imgStatic.nativeElement.hidden=true
    this.imgTimeLapse.nativeElement.hidden=false
    this.updateSlideshow(this.imgCollection)
    this.imageRefTimeStamp = temp
  }

  updateSlideshow(imgCollection: any[]){
    if (imgCollection.length > 0) {
      let img = imgCollection.pop()
      //console.log(imgCollection,length)
      this.imageRefTimeStamp = new Date(img.time).toLocaleString('en-ZA')
      this.imgTimeLapse.nativeElement.src=img.img
      setTimeout(() => {
        this.updateSlideshow(imgCollection)
      }, 200)
    } else {
      console.log('finished')
      this.imgTimeLapse.nativeElement.hidden=true
      this.imgStatic.nativeElement.hidden=false
      this.slideshowFinished()
      this.playButtonDisabled = true
    }
  }

  async timelapseCreatedAlert() {
    const alert = await this.alertController.create({
      //cssClass: '',
      header: 'Success',
      //subHeader: 'Subtitle',
      message: 'Timelapse has been created',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async slideshowFinished() {
    const alert = await this.alertController.create({
      //cssClass: '',
      header: 'Finished',
      //subHeader: 'Subtitle',
      message: 'Timelapse has finished',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async variFinished() {
    const alert = await this.alertController.create({
      //cssClass: '',
      header: 'Finished',
      //subHeader: 'Subtitle',
      message: 'VARI image has finished',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  showImg() {
    this.imgProcProgress = 0;
    this.openCVLoadResult = this.ngOpenCVService.isReady$;
    if (this.variCanvas != undefined) {
      this.openCVLoadResult = this.ngOpenCVService.isReady$;
      let canvas = this.variCanvas.nativeElement;
      if (this.variCxt != undefined) {
        this.variCxt.clearRect(0, 0, canvas.width, canvas.height);
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous'
      this.variCxt = this.variCanvas.nativeElement.getContext("2d");
      img.onload = () => {
        canvas.height = this.imgHeight;
        canvas.width = this.imgWidth;
        this.variCxt.imageSmoothingEnabled = false;
        this.variCxt.imageSmoothingQuality = "high"
        this.variCxt.drawImage(img, 0, 0);
      };
      img.src = this.imageLink;
    }
  }

  drawImg() {
    this.imgProcProgress = 0;
    let canvas = this.variCanvas.nativeElement
    let src = new cv.Mat()
    src = cv.imread(canvas.id);
    if (this.variCxt != undefined) {
      this.variCxt.clearRect(0, 0, canvas.width, canvas.heigh);
    }
    let rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    let red = rgbaPlanes.get(0);
    let green = rgbaPlanes.get(1);
    let blue = rgbaPlanes.get(2);
    rgbaPlanes.delete();
    
    let dst1 = new cv.Mat();
    let dst2 = new cv.Mat();
    let dst3 = new cv.Mat();
    let mask = new cv.Mat();
    let dtype = -1;
    cv.subtract(green, red, dst1, mask, dtype)
    cv.add(green, red, dst2, mask, dtype)
    cv.subtract(dst2, blue, dst3, mask, dtype)
    red.delete(); green.delete(); blue.delete(); dst2.delete(); mask.delete(); 
    dst1.mul(dst3, -1);
    dst3.delete();
    let minMax = cv.minMaxLoc(dst1)
    cv.cvtColor(dst1, dst1, cv.COLOR_GRAY2RGBA, 0)
    let variCustomCmap = [
      {
        index: 0,
        rgb: [0, 0, 255]
      },
      {
        index: 1,
        rgb: [0, 255, 0]
      }
    ]
    let cmapVARI = colormap({
      colormap: "cool",
      nshades: minMax.maxVal+1,
      format: 'rba',
      alpha: [255, 255]
    })
    let colour = new cv.Mat(dst1.rows, dst1.cols, cv.CV_8UC4, new cv.Scalar(0,0,0))
    for (let row = 0; row < dst1.rows; row++) {
      for (let col = 0; col < dst1.cols; col++) {
        var pixel = dst1.ucharPtr(row, col)[0];
        var newPixel = cmapVARI[pixel]
        colour.ucharPtr(row, col)[0] = newPixel[0]
        colour.ucharPtr(row, col)[1] = newPixel[1]
        colour.ucharPtr(row, col)[2] = newPixel[2]
        colour.ucharPtr(row, col)[3] = 255       
      }
      this.imgProcProgress = Math.ceil((row/dst1.rows)*100);
    }
    cv.imshow('vari', colour);
    src.delete(); colour.delete(); dst1.delete();
    this.variFinished()
    console.log('finished')
  }

  getIndexVARI(red: number, green: number, blue: number){
    if ((green+red) == blue) {
      return (green-red)/(green+red-blue+1)
    } else {
      return (green-red)/(green+red-blue)
    }
  }

  fetchData() {
    let calibrationRes = this.firebaseApi.getCalibration();
    calibrationRes.snapshotChanges().subscribe(res => {
      let resSize = res.length-1
      this.calibrationMax = res[resSize].payload.val()['max'];
      this.calibrationMin = res[resSize].payload.val()['min'];
    })
    let dataRes = this.firebaseApi.getDataList();
    dataRes.snapshotChanges().subscribe(async res => {
      let newImagePath: any;
      let newImageStamp: any;
      let datestampArray = [];
      let resDataList = [];
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
          let prevImagePath = val[k]['img_path']
          if (prevImagePath != null) {
            newImagePath = val[k]['img_path'];
            newImageStamp = timestamp;
            resDataList.push(new lineDataSet(timestamp,soilArr,val[k]["temp_humid"],newImagePath,newImageStamp))
          } else {
            resDataList.push(new lineDataSet(timestamp,soilArr,val[k]["temp_humid"],null,null))
          }
        });
      });
      this.firstDate = resDataList[0].timestamp
      if (this.chartData) {
        this.updateCharts(resDataList)
      } else {
        this.createCharts(resDataList)
      }
      let lastImgPath = newImagePath
      let imageRef = this.fbStorage.ref("/" + lastImgPath).getDownloadURL()
      imageRef.forEach((val) =>{
        this.imageLink = val
        //console.log(this.imageLink)
        this.showImg()
      })
      this.imageRefTimeStamp = new Date(newImageStamp).toLocaleString('en-ZA');
    });    
  }

  getMoistureValue(num, chartData){
    let reportValue = []
    
    for (let trans of chartData) {
      reportValue.push(trans.soilMoisture[num])
    }
    
    return reportValue
  }

  getTempHumidValue(num, chartData){
    let reportValue = []

    for (let trans of chartData) {
      reportValue.push(trans.tempHumid[num])
    }

    return reportValue
  }

  getLabelValue(chartData) {
    let labelValue = []
    
    for (let trans of chartData) {
      labelValue.push(trans.timestamp)
    }
    return labelValue
  }

  createCharts(data: any){
    this.chartData = data;

    let chartLabel = this.getLabelValue(this.chartData);
    let chartData1 = this.getMoistureValue(0,this.chartData);
    let chartData2 = this.getMoistureValue(1,this.chartData);
    let chartData3 = this.getMoistureValue(2,this.chartData);
    let chartData4 = this.getMoistureValue(3,this.chartData);
    let chartData5 = this.getTempHumidValue(0,this.chartData);
    let chartData6 = this.getTempHumidValue(1,this.chartData);

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

    let chartLabel = this.getLabelValue(this.chartData);
    let chartData1 = this.getMoistureValue(0,this.chartData);
    let chartData2 = this.getMoistureValue(1,this.chartData);
    let chartData3 = this.getMoistureValue(2,this.chartData);
    let chartData4 = this.getMoistureValue(3,this.chartData);
    let chartData5 = this.getTempHumidValue(0,this.chartData);
    let chartData6 = this.getTempHumidValue(1,this.chartData);

    let chartDataList = [chartData1, chartData2, chartData3, chartData4];
    let chartTempHumidList = [chartData5, chartData6];
    // Update our dataset
    for (let index = 0; index < 4; index++) {
      this.valueLinesChart.data.datasets[index].data = chartDataList[index]   
    }
    for (let index = 0; index < 2; index++) {
      this.valueTempHumidChart.data.datasets[index].data = chartTempHumidList[index]
    }
    this.valueLinesChart.options.scales.x.min = this.pastDate.valueOf();
    this.valueTempHumidChart.options.scales.x.min = this.pastDate.valueOf();
    this.valueLinesChart.data.labels = chartLabel;
    this.valueTempHumidChart.data.labels = chartLabel;
    this.valueLinesChart.update();
    this.valueTempHumidChart.update();
  }
}
export class lineDataSet {
  timestamp: Date;
  soilMoisture: Number [];
  tempHumid: Number;
  imgPath: string;
  imgStamp

  constructor( timestamp, soilMoisture, tempHumid, imgPath, imgStamp) {
    this.timestamp = new Date(Date.parse(timestamp));
    this.soilMoisture = soilMoisture;
    this.tempHumid = tempHumid
    this.imgPath = imgPath
    this.imgStamp = imgStamp
  }
}
