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
    ageRange: Options = {
        floor: 10,
        ceil: 70
    };

    tuningWithOthers: number = 4;
    loneliness: number =4;
    happiness: number =4 ;

    feelingsRange: Options = {
        floor: 1,
        ceil: 7
    };


    data: any;
    constructor(private dataSvc: DataService) {
    }

    ngOnInit() {
    }

    getData() {
        this.dataSvc.sendPostQuestionnair(this.data).subscribe(res => {

        }, error => {

        });
    }
}
