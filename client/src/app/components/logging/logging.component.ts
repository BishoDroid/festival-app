import {Component, OnInit} from "@angular/core";
import {startWith, switchMap} from "rxjs/internal/operators";
import {interval} from "rxjs/index";
import {DataService} from "../../data.service";

@Component({
    selector: 'app-logging',
    templateUrl: './logging.component.html',
    styleUrls: ['./logging.component.css']
})
export class LoggingComponent implements OnInit {

    private maxLimit = 500;
    private limit = 25;
    public type = 'kima';
    public status = 'ERROR';
    public order = 'desc';

    public logs = [];

    constructor(private dataSvc: DataService) {
    }

    ngOnInit() {
        this.getData();
    }

    showMore() {
        if (this.limit < this.maxLimit) {
            this.limit += 25;
        }
    }
    getData() {
        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.dataSvc.getLogs('type=' + this.type + '&status=' + this.status + '&limit=' + this.limit + '&order='+this.order)))
            .subscribe(res => {
                this.logs = res.data;
            });
    }
}
