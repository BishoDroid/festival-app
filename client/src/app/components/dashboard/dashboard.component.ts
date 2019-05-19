import {Component, OnInit} from "@angular/core";
import {DataService} from "../../data.service";
import Chart from "chart.js";


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css', '../../app.component.css']
})
export class DashboardComponent implements OnInit {
     sessions: any;
     totalNumberOfSessions: number;
     totalNumberOfParticipants: number = 0;
     totalEngagementTime: number = 0;
    currentChart = [];
    selectedChart: number;
    ageChart = [];
    feelingsChart = [];
    kimaSessionsReportArray = [];
    kimaUsersReportArray = [] ;

    constructor(public dataSvc: DataService) {
    }

    ngOnInit() {

        this.dataSvc.getAllSessions().subscribe(res => {
            this.sessions = res.sessions;

            this.formUsersReport(this.sessions);
            let feelingsDataFromSessions = this.getFeelingsDataDataSet(this.sessions);

            let beforeEngagement = {
                label: 'Before Engagement',
                data: feelingsDataFromSessions[0],
                backgroundColor: 'rgba(0, 99, 132, 0.6)',
                borderColor: 'rgba(0, 99, 132, 1)',
                yAxisID: "y-axis"
            };

            let afterEngagement = {
                label: 'After Engagement',
                //data: [3 , 3 , 3 , 3 ],
                data: feelingsDataFromSessions[1],
                backgroundColor: 'rgba(99, 132, 0, 0.6)',
                borderColor: 'rgba(99, 132, 0, 1)',
                yAxisID: "y-axis"
            };

            let feelingsData = {
                labels: ["Connection With Others", "In Tune With Others", "Lonely", "Happy"],
                datasets: [beforeEngagement, afterEngagement]
            };

            let chartOptions = {
                scales: {
                    xAxes: [{
                        barPercentage: 1,
                        categoryPercentage: 0.6
                    }],
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                            // OR //
                            beginAtZero: true   // minimum value will be 0.
                        },
                        id: "y-axis"
                    }]
                }
            };

            let feelingsChart = new Chart('feelingsChart', {
                type: 'bar',
                data: feelingsData,
                options: chartOptions
            });



            let data = this.getAgeOfParticpantsData(this.sessions);
            console.log(data);
            let ctx = document.getElementById("ageChart");
            this.ageChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ["10-20", "21-30", "31-40", "41-50", "50-70"],
                    datasets: [
                        {
                            label: "Age Of Participants",
                            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                            data: data
                        }
                    ]
                },
                options: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: 'Age Of Particpants'
                    }
                }
            });

            console.log(this.sessions);
            this.totalNumberOfSessions = this.sessions.length;
            console.log(this.totalNumberOfSessions);
            this.sessions.forEach( (session, index) => {
                session.particpantsCompletedPreQuest = this.getNumberOfUsersCompletedPreQuestionair(session);
                session.particpantsCompletedPostQuest = this.getNumberOfUsersCompletedPostQuestionair(session);
                console.log(session.recordingStopTime);
                console.log(session.recordingStartTime);
                let stop = (Date.parse(session.recordingStopTime));
                let start = (Date.parse(session.recordingStartTime));
                if (start && stop) {
                    session.engagementDuration = Math.floor(((stop - start) / 1000) / 60);
                } else {
                    session.engagementDuration = 0;
                }

                if (!isNaN(session.engagementDuration)) {
                    this.totalEngagementTime += session.engagementDuration;
                }
                this.totalNumberOfParticipants += session.particpantsCompletedPreQuest;

                this.kimaSessionsReportArray.push("data:text/csv;charset=utf-8," +
                    "ID/No, Registration Time , Participants Completed Pre Quest ,  Participants Completed Pre Quest , Session duration ");

                let line = (index + 1 ).toString(10) + " ," +  session.timestamp + "," + session.particpantsCompletedPreQuest + "," + session.particpantsCompletedPostQuest + "," + session.engagementDuration  ;
                this.kimaSessionsReportArray.push(line);
            });
        }, error => {

        });
    }

    getFeelingsDataDataSet(sessions) {
        console.log(sessions);
        let connectionWithOthersBefore = 0;
        let connectionWithOthersAfter = 0 ;
        let tuningWithPeopleBefore = 0;
        let tuningWithPeopleAfter = 0;
        let lonelinessBefore = 0;
        let lonelinessAfter = 0;
        let happinessBefore = 0;
        let happinessAfter = 0 ;
        let noOfParticipantsCompletedPreAndPostQuestionaire = 0;


        // only count users who completed the pre and the post questionnaire
        sessions.forEach(session => {
            session.users.forEach(user => {
                if (user.preQuest === undefined || user.postQuest === undefined) {
                    return;
                }
                console.log(user);
                ++noOfParticipantsCompletedPreAndPostQuestionaire;

                connectionWithOthersBefore += user.preQuest.connectionWithOthersScale;
                connectionWithOthersAfter += user.postQuest.connectionWithOthersScale;

                tuningWithPeopleBefore += user.preQuest.tuningWithPeopleScale;
                tuningWithPeopleAfter += user.postQuest.tuningWithPeopleScale;

                lonelinessBefore += user.preQuest.lonelinessScale;
                lonelinessAfter += user.postQuest.lonelinessScale;

                happinessBefore += user.preQuest.happinessScale;
                happinessAfter += user.postQuest.happinessScale;
            });


        });

        return ([
            // tslint:disable-next-line:max-line-length
            [connectionWithOthersBefore, tuningWithPeopleBefore , lonelinessBefore , happinessBefore].map(x => x  / noOfParticipantsCompletedPreAndPostQuestionaire ),
            [connectionWithOthersAfter, tuningWithPeopleAfter, lonelinessAfter, happinessAfter].map(x => x  / noOfParticipantsCompletedPreAndPostQuestionaire )
            ] );
    }


    getAgeOfParticpantsData(sessions) {

        // tslint:disable-next-line:no-unused-expression prefer-const
        let _10to20 = 0, _21to30 = 0, _31to40 = 0, _41to50 = 0, _51to70 = 0;
        let data = [_10to20, _21to30, _31to40, _41to50, _51to70];
        console.log(sessions);
        sessions.forEach(session => {
            session.users.forEach(user => {
            if (user.preQuest === undefined) {
                return;
            }
                switch (true) {
                    case (user.preQuest.age >= 10 && user.preQuest.age <= 20 ):
                        data[0] += 1;
                        break;
                    case (user.preQuest.age >= 21 && user.preQuest.age < 31 ):
                        data[1] += 1;
                        break;
                    case (user.preQuest.age >= 31 && user.preQuest.age < 41 ):
                        data[2] += 1;
                        break;
                    case (user.preQuest.age >= 41 && user.preQuest.age < 51 ):
                        data[3] += 1;
                        break;
                    case (user.preQuest.age >= 51 && user.preQuest.age < 71 ):
                        data[4] += 1;
                        break;
                    default:
                        break;
                }

            });

        });

        return data;

    }

    getNumberOfUsersCompletedPreQuestionair(session) {
        return session.users.filter(user => user.preQuest !== undefined).length;
    }

    getNumberOfUsersCompletedPostQuestionair(session) {
        return session.users.filter(user => user.postQuest !== undefined).length;
    }

    formUsersReport(sessions) {

        this.kimaUsersReportArray.push("data:text/csv;charset=utf-8," +
            "Session no, Age , Gender ,  Pre-Connection , Pre-Tuning , Pre-Loneliness , Pre-Happiness ," +
            " Post-Connection , Post-Tuning , Post-Loneliness , Post-Happiness ");

        let lineCommon = " " ;

        sessions.forEach(session => {
            lineCommon += session._id + " , " ;


            session.users.forEach(user => {
                let lineUser = " ";

                if (user.preQuest === undefined) {
                    lineUser += " , , , , , , ";
                } else {
                    lineUser += user.preQuest.age + ", " +
                                user.preQuest.gender + ", " +
                                user.preQuest.connectionWithOthersScale + ", " +
                                user.preQuest.tuningWithPeopleScale + " , " +
                                user.preQuest.lonelinessScale + " , " +
                                user.preQuest.happinessScale + " , ";
                }

                if (user.postQuest === undefined)  {
                    lineUser += " , , , , ";
                } else {

                    lineUser += user.postQuest.connectionWithOthersScale + ", " +
                                user.postQuest.tuningWithPeopleScale + " , " +
                                user.postQuest.lonelinessScale + " , " +
                                user.postQuest.happinessScale ;
                }

                this.kimaUsersReportArray.push(lineCommon + lineUser);

            });

        });

    }
    showGraph(session: any, i: number) {


        this.selectedChart = i;
        let canvDev = document.getElementById("candev");
        if (document.getElementById("sessionToShow")) {
            let oldCanvas = document.getElementById("sessionToShow");
            oldCanvas.parentElement.removeChild(oldCanvas);
        }

        let canvas = document.createElement("canvas");

        canvas.id = "sessionToShow";

        let checkExist = setInterval(function () {
            if (canvDev != null) {

                console.log("Exists!");
                canvDev.appendChild(canvas);
                clearInterval(checkExist);
                attachGraph();
            }
            else {
                canvDev = document.getElementById("candev");
            }

        }, 100);


        function attachGraph() {
            let thirdDates = [];
            let thirdValues = [];
            let fifthDates = [];
            let fifthValues = [];
            let octaveDates = [];
            let octaveValues = [];
            session.chart = [];
            if (!session.sessionData.length) {
                return;
            }
            session.sessionData.forEach(data => {

                if (data.readingType === '/third') {
                    let jsdate = new Date(Date.parse(data.timestamp));
                    thirdDates.push(jsdate.toLocaleTimeString('en', {hour: '2-digit', minute: '2-digit'}))

                    thirdValues.push(parseInt(data.value, 10));
                } else if (data.recordingType === '/fifth') {
                    let jsdate = new Date(Date.parse(data.timestamp));
                    fifthDates.push(jsdate.toLocaleTimeString('en', {hour: '2-digit', minute: '2-digit'}))

                    fifthValues.push(parseInt(data.value, 10));
                } else if (data.recordingType === '/octave') {
                    let jsdate = new Date(Date.parse(data.timestamp));
                    octaveDates.push(jsdate.toLocaleTimeString('en', {hour: '2-digit', minute: '2-digit'}))

                    octaveValues.push(parseInt(data.value, 10));
                }
            });


            let ctx = document.getElementById("sessionToShow");
            console.log(ctx);
            this.currentChart = new Chart(ctx, {
                type: 'line',
                lineTension: 0,
                data: {
                    labels: thirdDates,
                    datasets: [{
                        lineTension: 0,
                        data: thirdValues,
                        borderColor: "#ffcc00",
                        fill: false

                    }
                    ]
                },
                options: {
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            label: "time",
                            display: true
                        }],
                        yAxes: [{
                            label: "3rd harmony",
                            display: true
                        }],
                    }
                }
            });
        }
    }

    downloadKimaSessions() {

        var csvContent = this.kimaSessionsReportArray.join("\n");

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "kima_sessions.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "my_data.csv".
    }

    downloadKimaUsers() {
        var csvContent =  this.kimaUsersReportArray.join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "kima_users.csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file named "my_data.csv".
    }


    downloadSymbiosisSessions() {

    }


    downloadSymbiosisUsers() {

    }
}
