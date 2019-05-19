import { Component, OnInit } from '@angular/core';
import {Options} from "ng5-slider";
import {DataService} from "../../data.service";

@Component({
  selector: 'app-post-questionaire',
  templateUrl: './post-questionaire.component.html',
  styleUrls: ['./post-questionaire.component.css', '../../app.component.css']
})
export class PostQuestionaireComponent implements OnInit {
   selectedImage: number;

  constructor(private dataSvc: DataService) { }
  connectednessWithOthers: any = ['11.png', '22.png', '33.png', '44.png', '55.png', '66.png', '77.png'];

  singingPartnerFamiliarity = 'yes';
  symbiosisRoomFamiliarity = 'one';
  tuningWithPeopleScale = 4;
  lonelinessScale = 4;
  happinessScale = 4 ;

  feelingsRange: Options = {
    floor: 1,
    ceil: 7
  };
  private connectionWithOthersScale: number;

  data: {
    singingPartnerFamiliarity: string,
    symbiosisRoomFamiliarity: string,
    connectionWithOthersScale: Number,
    tuningWithPeopleScale: Number,
    happinessScale: number,
    lonelinessScale: number } ;
  clientId: string = "";
  private header: { "client-id": String };
  showMsg: boolean;

  onImageClick(i: number, imagePath: String) {
    this.connectionWithOthersScale = i + 1;
    this.selectedImage = i;
  }

  ngOnInit() {
    const tablet = JSON.parse(localStorage.getItem('tablet'));
    this.clientId = tablet.tabletId;
  }

  sendData() {

    this.data =  {
      "connectionWithOthersScale" : this.connectionWithOthersScale,
      "singingPartnerFamiliarity" : this.singingPartnerFamiliarity,
      "symbiosisRoomFamiliarity" : this.symbiosisRoomFamiliarity,
      "tuningWithPeopleScale" : this.tuningWithPeopleScale,
      "lonelinessScale" : this.lonelinessScale ,
      "happinessScale" : this.happinessScale
    };
    console.log(this.data);
    console.log(this.clientId);
    this.header = {"client-id" : this.clientId};
    this.dataSvc.sendPostQuestionnair(this.data, this.header).subscribe(res => {
      console.log(res);
      this.showMsg   = true;
      setInterval(() => {
        this.showMsg = false;
      }, 2000);
      console.log(res);
    }, error => {
      console.log(error);
    });
  }

}
