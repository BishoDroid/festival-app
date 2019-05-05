import { Component, OnInit } from '@angular/core';
import {DataService} from "../../data.service";
import {interval, Observable} from "rxjs";
import {startWith, switchMap} from "rxjs/operators";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private data: any = [];
  private sessionsObservable: Observable<any>;
  private sessions: any;

  constructor(private dataSvc: DataService) {  }

  ngOnInit() {
    interval(3000)
        .pipe(
            startWith(0),
            switchMap(() => this.dataSvc.getActiveSessions())
        )
        .subscribe(res => {
          this.sessions = res;
          console.log(this.sessions);
          this.sessions.forEach(session => {
            session.particpantsCompletedPreQuest = this.getNumberOfUsersCompletedPreQuestionair(session);
            console.log(particpantsCompletedPreQuest);
          });
        });

    console.log("Im getting data");
  }


   getNumberOfUsersCompletedPreQuestionair(session) {
    return session.users.filter(user => user.preQuest !== undefined ).length;
  }



  startRecording(_id: string) {
    console.log (_id);
    const headers = {'session-id' : _id };

    this.dataSvc.startRecording(headers).subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
    });
  }

  stopRecording(_id: string) {
    console.log (_id);
    const headers = {'session-id' : _id };

    this.dataSvc.stopRecording(headers).subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
    });
  }


  cancelSession( _id: string) {
    console.log (_id);
    const headers = {'session-id' : _id };

    this.dataSvc.removeSession(headers).subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
    });
  }
}
