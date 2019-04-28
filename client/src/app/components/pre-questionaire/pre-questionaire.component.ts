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
    connectednessWithOthers: any = ['11.png', '22.png', '33.png', '44.png', '55.png', '66.png', '77.png']
    age: number = 18;
    gender: String = "male";
    ageRange: Options = {
        floor: 10,
        ceil: 70
    };
     connectionWithOthersScale: number = 1;
     selectedImage: number;

    onImageClick(i: number, imagePath: String) {
        this.connectionWithOthersScale = i + 1;
        this.selectedImage = i;
    }
    tuningWithPeopleScale: number = 4;
    lonelinessScale: number =4;
    happinessScale: number =4 ;

    feelingsRange: Options = {
        floor: 1,
        ceil: 7
    };

    data: {  age: Number,
        gender: String,
        connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: Number,
        lonelinessScale: Number } ;
    clientId: String = "client-";
    private header: { "client-id": String };


    constructor(private dataSvc: DataService) {
    }

    ngOnInit() {
    }

    sendData() {

       this.data = {
            "age" : this.age,
            "gender" : this.gender,
            "connectionWithOthersScale" : this.connectionWithOthersScale,
            "tuningWithPeopleScale" : this.tuningWithPeopleScale,
            "lonelinessScale" : this.lonelinessScale ,
            "happinessScale" : this.happinessScale
        };

        this.header = {"client-id" : this.clientId};
        console.log(this.data);
        console.log(this.header);
        this.dataSvc.sendPreQuestionnair(this.data, this.header).subscribe(res => {
            console.log(res);
        }, error => {
            console.log(error);
        });
    }


}
