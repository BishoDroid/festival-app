import {Component, OnInit, TemplateRef} from "@angular/core";
import {DataService} from "../../data.service";
import {interval} from "rxjs";
import {startWith, switchMap} from "rxjs/operators";
import {BsModalRef, BsModalService} from "ngx-bootstrap";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    public inProgress: boolean = false;
    public choice: string;
    public currentPass: string;
    public newPass: string = '';
    public confirmPass: string = '';
    public showError: boolean = false;
    public errorMsg: string = '';
    public data: any = [];
    public sessions: any;
    public symbTablets: any = [];
    public kimaTablets: any = [];
    public allTablets: any = [];
    public kimaChoice: any = {};
    public symbChoice: any = {};
    public selectedTablet: any = {};
    modalRef: BsModalRef;
    public savedTablet = JSON.parse(localStorage.getItem('tablet'));
    public myModal: any = {
        title: '', cancelLabel: 'No', submitLabel: 'Yes', content: '', functionName: ''
    };
    public defaultTablet: any = {
        type: 'none', tabletId: 'free-tablet', isTaken: false
    };

    constructor(public dataSvc: DataService, private modalService: BsModalService) {
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
                    console.log(session.status)
                    session.particpantsCompletedPreQuest = this.getNumberOfUsersCompletedPreQuestionair(session);
                    session.particpantsCompletedPostQuest = this.getNumberOfUsersCompletedPostQuestionair(session);
                    if (session.status === undefined) {
                        session.status = "ready to record";
                    }
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
        this.inProgress = true;
        this.dataSvc.saveTablet(body).subscribe(res => {
            if (res.code === 200) {
                this.inProgress = false;

                console.log(res.msg);
                localStorage.setItem('tablet', JSON.stringify(body));
                this.savedTablet = body;
                this.kimaChoice.type = 'none';
            } else {
                this.errorMsg = 'Something went wrong while trying to save tablet. Please try again.\n' + res.msg;
                this.showError = true;
                this.inProgress = false;

            }
        });
    }

    resetTablets() {
        this.inProgress = true;
        this.dataSvc.resetTablets().subscribe(res => {
            console.log(res);
            if (res.code === 200) {
                this.inProgress = false;
                this.modalRef.hide();
                console.log(res.msg);
                localStorage.removeItem('tablet');
                this.savedTablet = this.defaultTablet;
            } else {
                this.errorMsg = 'Something went wrong while trying to reset all tablet. Please try again.';
                this.showError = true;
                this.inProgress = false;
                this.modalRef.hide();
            }
        });
    }

    resetMyTablet() {
        const myTablet = this.savedTablet;
        this.inProgress = true;
        this.dataSvc.resetTabletById(myTablet.tabletId).subscribe(res => {
            if (res.code === 200) {
                this.inProgress = false;
                this.modalRef.hide();
                console.log(res.msg);
                localStorage.removeItem('tablet');
                this.savedTablet = this.defaultTablet;
            } else {
                this.errorMsg = 'Something went wrong while trying to reset this tablet. Please try again.';
                this.showError = true;
                this.inProgress = false;
                this.modalRef.hide();
            }
        });
    }

    setChoice(tablet: any, type: string) {
        tablet.type = type;
        type === 'kima' ? this.kimaChoice = tablet : this.symbChoice = tablet;
    }

    updatePassword() {
        this.showError = false;
        console.log("TABLET: " + JSON.stringify(this.savedTablet));
        const header = {"client-id": this.savedTablet.tabletId};

        const currentEnc = btoa(this.currentPass);
        const newEnc = btoa(this.newPass);

        if (this.confirmPass === this.newPass) {
            this.dataSvc.updatePassword(header, {value: [currentEnc, newEnc]}).subscribe(res => {
                console.log(res);
            })

        } else {
            this.errorMsg = 'New password and current password do not match';
            this.showError = true;
        }
    }

    callFunction(name: string) {
        name === 'resetMyTablet' ? this.resetMyTablet() : this.resetTablets();
    }

    openModal(template: TemplateRef<any>, name: string) {
        this.myModal.title = 'Are you sure?';
        this.myModal.content = 'Are you sure you want to perform this action?';
        this.myModal.functionName = name;
        this.modalRef = this.modalService.show(template);
    }
}
