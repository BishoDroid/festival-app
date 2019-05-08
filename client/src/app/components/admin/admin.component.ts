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
    public kTablets: any = [{title: 'Entrance 1', value: 'tablet-entrance-1'}, {title: 'Entrance 2', value: 'tablet-entrance-2'},
        {title: 'Entrance 3', value: 'tablet-entrance-3'}, {title: 'Entrance 4', value: 'tablet-entrance-4'}];
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
                console.log(this.sessions);
                this.sessions.forEach(session => {
                    session.particpantsCompletedPreQuest = this.getNumberOfUsersCompletedPreQuestionair(session);
                    session.particpantsCompletedPostQuest = this.getNumberOfUsersCompletedPostQuestionair(session);
                    console.log(session.particpantsCompletedPreQuest);
                });
            });
        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.dataSvc.getTablets('all')))
            .subscribe(res => {
                this.setTablets(res, 'kima');
                console.log(this.symbTablets);
            });
        interval(3000)
            .pipe(
                startWith(0),
                switchMap(() =>
                    this.dataSvc.getTablets('all')))
            .subscribe(res => {
                this.setTablets(res, 'symb');
                console.log(this.symbTablets);
            });

        console.log("Im getting data");
    }


    setTablets(data: any, type: string) {
        let limit = type === 'kima' ? 4 : 8;
        let start = data.length > 0 ? data.length : 0;
        for (let i = start; i < limit; i++) {
            if (data[i]) {
                type === 'kima' ? this.kimaTablets[i] = data[i] : this.symbTablets[i] = data[i];
            } else {
                type === 'kima' ? this.kimaTablets[i] = this.defaultTablet : this.symbTablets[i] = this.defaultTablet;
            }
        }
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

}
