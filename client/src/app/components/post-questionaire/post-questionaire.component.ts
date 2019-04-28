import { Component, OnInit } from '@angular/core';
import {Options} from "ng5-slider";
import {DataService} from "../../data.service";

@Component({
  selector: 'app-post-questionaire',
  templateUrl: './post-questionaire.component.html',
  styleUrls: ['./post-questionaire.component.css']
})
export class PostQuestionaireComponent implements OnInit {

  singingPartnerFamiliarity: string = 'yes';
  symbiosisRoomFamiliarity: string = 'one';
  tuningWithPeopleScale: number = 4;
  lonelinessScale: number =4;
  happinessScale: number =4 ;

  feelingsRange: Options = {
    floor: 1,
    ceil: 7
  };

  data: {
    singingPartnerFamiliarity: string,
    symbiosisRoomFamiliarity: string,
    // connectionWithOthersScale: Number,
    tuningWithPeopleScale: Number,
    happinessScale: Number,
    lonelinessScale: Number } ;
  clientId: String = "client-";

  constructor(private dataSvc: DataService) { }

  ngOnInit() {
  }

  sendData() {

    this.data =  {
      "singingPartnerFamiliarity" : this.singingPartnerFamiliarity,
      "symbiosisRoomFamiliarity" : this.symbiosisRoomFamiliarity,
      "tuningWithPeopleScale" : this.tuningWithPeopleScale,
      "lonelinessScale" : this.lonelinessScale ,
      "happinessScale" : this.happinessScale
    };
    console.log(this.data);
    this.dataSvc.sendPostQuestionnair(this.data).subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
    });
  }

}
