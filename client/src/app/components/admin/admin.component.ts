import {Component, OnInit} from "@angular/core";
import {DataService} from "../../data.service";
import {interval, Observable} from "rxjs";
import {startWith, switchMap} from "rxjs/operators";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    public data: any = [];
    public sessionsObservable: Observable<any>;
    public sessions: any;
    public symbTablets: any = [];
    public kimaTablets: any = [];
    public allTablets: any = [];
    public defaultTablet: any = {
        type: 'none', tabletId: 'free-tablet', isTaken: false
    };
    public kimaChoice: any = {};
    public symbChoice: any = {};
    public choice: string;
    public selectedTablet: any = {};

    public savedTablet = JSON.parse(localStorage.getItem('tablet'));

    constructor(public dataSvc: DataService) {
        if (this.savedTablet === null) {
            this.savedTablet = this.defaultTablet;
        }
    }

    ngOnInit() {
        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() => this.dataSvc.getActiveSessions()))
            .subscribe(res => {
                this.sessions = res;
                this.sessions.forEach(session => {
                    session.particpantsCompletedPreQuest = this.getNumberOfUsersCompletedPreQuestionair(session);
                    session.particpantsCompletedPostQuest = this.getNumberOfUsersCompletedPostQuestionair(session);
                    console.log(session.particpantsCompletedPreQuest);
                });
            });

        this.getData('all');

    }


    getData(type: string) {
        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.dataSvc.getTablets(type)))
            .subscribe(res => {
                this.allTablets = res.data;
            });
    }


    getNumberOfUsersCompletedPreQuestionair(session) {
        return session.users.filter(user => user.preQuest !== undefined).length;
    }

    getNumberOfUsersCompletedPostQuestionair(session) {
        return session.users.filter(user => user.postQuest !== undefined).length;
    }


    startRecording(_id: string) {
        console.log(_id);
        const headers = {'session-id': _id};

        this.dataSvc.startRecording(headers).subscribe(res => {
            console.log(res);
        }, error => {
            console.log(error);
        });
    }

    stopRecording(_id: string) {
        console.log(_id);
        const headers = {'session-id': _id};

        this.dataSvc.stopRecording(headers).subscribe(res => {
            console.log(res);
        }, error => {
            console.log(error);
        });
    }

    cancelSession(_id: string) {
        console.log(_id);
        const headers = {'session-id': _id};

        this.dataSvc.removeSession(headers).subscribe(res => {
            console.log(res);
        }, error => {
            console.log(error);
        });
    }

    chooseClass(isTaken: boolean): string {
        return isTaken ? 'box-container-disabled' : 'box-container clickable';
    }

    saveChoice(param: string) {
        const body = {
            type: param, tabletId: this.choice, isTaken: true
        };

        this.dataSvc.saveTablet(body).subscribe(res => {
            console.log(res)
            if (res.code === 200) {
                console.log(res.msg);
                localStorage.setItem('tablet', JSON.stringify(body));
                this.savedTablet = body;
                this.kimaChoice.type = 'none';
            } else {
                console.log(res.msg);
            }
        });
    }

    resetTablets(type: string) {
        this.dataSvc.resetTablets(type).subscribe(res => {
            console.log(res);
            if (res.code === 200) {
                console.log(res.msg);
                localStorage.removeItem('tablet');
                this.savedTablet = this.defaultTablet;
            }
        });
    }

    setChoice(tablet: any, type: string) {
        tablet.type = type;
        type === 'kima' ? this.kimaChoice = tablet : this.symbChoice = tablet;
    }
}
