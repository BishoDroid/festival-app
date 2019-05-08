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

    /*setTablets(data: any, type: string) {
     this.allTablets  = data;
     this.kimaTablets = this.allTablets.filter(tablet => tablet.type.indexOf('kima') !== -1);
     this.symbTablets = this.allTablets.filter(tablet => tablet.type.indexOf('symb') !== -1);

     let limit = type === 'kima' ? 4 : 8;
     for (let i = 0; i < limit; i++) {
     if (type === 'kima' && !this.kimaTablets[i]) {
     console.log('Its kima')
     this.kimaTablets[i] = this.defaultTablet;
     }
     if (type === 'symb' && !this.symbTablets[i]) {
     this.symbTablets[i] = this.defaultTablet;
     }
     }
     if(type ==='kima'){
     console.log(this.kimaTablets)
     }
     }*/

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
                localStorage.setItem('tablet', JSON.stringify(body));
                this.savedTablet = body;
                this.kimaChoice.type = 'none';
            } else {
                console.log(res.msg);
            }
        });
    }

    setChoice(tablet: any) {
        tablet.type = 'kima';
        this.kimaChoice = tablet;
    }
}
