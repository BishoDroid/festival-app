import {Component, OnInit} from "@angular/core";

@Component({
    selector: 'festival-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    message: 'App Works'

    ngOnInit(): void {
    }

}
