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
    public symbTablets: any = [8];
    public kimaTablets: any = [4];
    public defaultTablet: any = {
        type: 'none', tabletId: 'free-tablet', isTaken: false
    };
    public kimaChoice: any = {};
    public choice: string;
    public selectedTablet: any = {};

    constructor(public dataSvc: DataService) {
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
                });
            });
        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.dataSvc.getTablets('kima')))
            .subscribe(res => {
                this.setTablets(res, 'kima');
            });

        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.dataSvc.getTablets('symb')))
            .subscribe(res => {
                this.setTablets(res.data, 'symb');
            });
        console.log("Im getting data");
    }


    setTablets(data: any, type: string) {
        console.log(data);
        let limit = type === 'kima' ? 4 : 8;
        let start = data.length > 0 ? data.length : 0;
        for (let i = start; i < limit; i++) {
            if (data[i]) {
                console.log('Setting tablets...' + JSON.stringify(data));
                type === 'kima' && this.kimaTablets.length < 4 ? this.kimaTablets[i] = data[i] : this.symbTablets[i] = data[i];
            } else {
                type === 'kima' && this.kimaTablets.length < 4 ? this.kimaTablets[i] = this.defaultTablet : this.symbTablets[i] = this.defaultTablet;
            }
        }
    }

    getNumberOfUsersCompletedPreQuestionair(session) {
        return session.users.filter(user => user.preQuest !== undefined).length;
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
        console.log(body)
        this.dataSvc.saveTablet(body).subscribe(res => {
            console.log(res)
            if (res.code === 200) {
                console.log(res.msg);
            } else {
                console.log(res.msg);
            }
        });
    }
    setChoice(tablet: any) {
        this.kimaChoice = tablet;
        this.kimaChoice.type = 'kima';
    }
}
