import {Component, OnInit} from "@angular/core";
import {DataService} from "../../data.service";

@Component({
    selector: 'app-pre-questionaire',
    templateUrl: './pre-questionaire.component.html',
    styleUrls: ['./pre-questionaire.component.css']
})
export class PreQuestionaireComponent implements OnInit {

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
