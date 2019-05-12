import {Component, OnInit} from "@angular/core";
import {DataService} from "../../data.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-first-run',
    templateUrl: './first-run.component.html',
    styleUrls: ['./first-run.component.css']
})
export class FirstRunComponent implements OnInit {

    public password: string;
    public showError = false;
    public errorMessage: string;

    constructor(private dataSvc: DataService, private router: Router) {
    }

    ngOnInit() {
    }

    savePassword() {
        if (this.password && this.password.length > 8) {
            this.showError = false;
            const header = {"client-id": "free-tablet"};
            console.log('passwordEnc: ' + btoa(this.password));
            this.dataSvc.savePassword(header, {"value": btoa(this.password)})
                .subscribe(res => {
                    console.log(res);
                    if (401 === res.code) {
                        console.log(res.msg);
                    } else {
                        console.log('Saved password: ' + JSON.stringify(res));
                        this.dataSvc.updateFirstRun(header, {value: [false]}).subscribe(res2 => {
                            if (res2.code === 200) {
                                this.router.navigate(['/admin']);
                            } else {
                                this.errorMessage = res2.msg;
                                this.showError = true;
                            }
                        });
                    }
                });
        } else {
            this.errorMessage = 'The password must be at least 8 characters';
            this.showError = true;
        }
    }
}
