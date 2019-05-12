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

    constructor(public dataSvc: DataService) {
    }

    ngOnInit() {

        this.dataSvc.getAllSessions().subscribe(res => {

            let beforeEngagement = {
                label: 'Before Engagement',
                data: [3, 4, 5, 6],
                backgroundColor: 'rgba(0, 99, 132, 0.6)',
                borderColor: 'rgba(0, 99, 132, 1)',
                yAxisID: "y-axis"
            };

            let afterEngagement = {
                label: 'After Engagement',
                //data: [3 , 3 , 3 , 3 ],
                data: [3.7, 8.9, 9.8, 3.7],
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


            this.sessions = res.sessions;
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
            this.sessions.forEach(session => {
                session.particpantsCompletedPreQuest = this.getNumberOfUsersCompletedPreQuestionair(session);
                session.particpantsCompletedPostQuest = this.getNumberOfUsersCompletedPostQuestionair(session);
                console.log(session.recordingStopTime);
                console.log(session.recordingStartTime);
                let stop = (Date.parse(session.recordingStopTime));
                let start = (Date.parse(session.recordingStartTime));
                session.engagementDuration = Math.floor(((stop - start) / 1000) / 60);
                if (!isNaN(session.engagementDuration)) {
                    this.totalEngagementTime += session.engagementDuration;
                }
                this.totalNumberOfParticipants += session.particpantsCompletedPreQuest;

            });
        }, error => {

        });
    }

    getFeelingsDataDataSet(sessions) {
        // only count users who completed the pre and the post questionnaire
        sessions.forEach(session => {
            session.forEach(user => {

                if (user.preQuest && user.postQuest) {


                }

            });

        });

    }

    getAgeOfParticpantsData(sessions) {

        // tslint:disable-next-line:no-unused-expression prefer-const
        let _10to20 = 0, _21to30 = 0, _31to40 = 0, _41to50 = 0, _51to70 = 0;
        let data = [_10to20, _21to30, _31to40, _41to50, _51to70];

        sessions.forEach(session => {

            session.users.forEach(user => {

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




                        /*{
                         data: fifthValues,
                         borderColor: "#eecc33",
                         fill: false
                         },
                         {
                         data: octaveValues,
                         borderColor: "#ff22ff",
                         fill: false
                         }*/
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
}
