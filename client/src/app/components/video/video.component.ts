import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

    constructor(private router: Router) {
    }

    ngOnInit() {
    }

    goToPostQuestionnaire() {
        this.router.navigate(['post-quest']);
    }
}
