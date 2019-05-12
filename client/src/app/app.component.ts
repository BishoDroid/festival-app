import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {DataService} from "./data.service";

@Component({
    selector: 'festival-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    constructor(private router: Router, private dataSvc: DataService) {
    }

    ngOnInit(): void {
        this.dataSvc.isFirstRun().subscribe(res => {
            console.log(res)
            if (res.code === 301) {
                this.router.navigate(['/first']);
            }
        });
    }

}
