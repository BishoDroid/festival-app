import {Component, OnInit} from "@angular/core";
import {DataService} from "../../data.service";
import { Options } from 'ng5-slider';
import {MatRadioModule} from '@angular/material/radio';
@Component({
    selector: 'app-pre-questionaire',
    templateUrl: './pre-questionaire.component.html',
    styleUrls: ['./pre-questionaire.component.css']
})
export class PreQuestionaireComponent implements OnInit {

    age: number = 18;
    gender: String = "male";
    ageRange: Options = {
        floor: 10,
        ceil: 70
    };

    tuningWithPeopleScale: number = 4;
    lonelinessScale: number =4;
    happinessScale: number =4 ;

    feelingsRange: Options = {
        floor: 1,
        ceil: 7
    };

    data: {  age: Number,
        gender: String,
        // connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: Number,
        lonelinessScale: Number } = {
        "age" : this.age,
        "gender" : this.gender,
        "tuningWithPeopleScale" : this.tuningWithPeopleScale,
        "lonelinessScale" : this.lonelinessScale ,
        "happinessScale" : this.happinessScale
    }


    constructor(private dataSvc: DataService) {
    }

    ngOnInit() {
    }

    sendData() {
        console.log(this.data);
        this.dataSvc.sendPreQuestionnair(this.data).subscribe(res => {
            console.log(res);
        }, error => {
            console.log(error);
        });
    }
}
