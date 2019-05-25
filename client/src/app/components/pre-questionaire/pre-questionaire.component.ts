import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {DataService} from "../../data.service";
import {Options} from "ng5-slider";
import {Router} from "@angular/router";

@Component({
    selector: 'app-pre-questionaire',
    templateUrl: './pre-questionaire.component.html',
    styleUrls: ['./pre-questionaire.component.css', '../../app.component.css']
})
export class PreQuestionaireComponent implements OnInit {
    @ViewChild("myElem") MyProp: ElementRef;

    connectednessWithOthers: any = ['11.png', '22.png', '33.png', '44.png', '55.png', '66.png', '77.png']
    age: number = 18;
    isLoading = false;
    gender: String = "male";
    ageRange: Options = {
        floor: 10,
        ceil: 70,
        showSelectionBar: true,
        selectionBarGradient: {
            from: 'white',
            to: '#e31d93'
        },
        getPointerColor: (value: number): string => {
            return '#6f2277';
        }
    };
    connectionWithOthersScale: number = 1;
    selectedImage = 0;
    onImageClick(i: number, imagePath: String) {
        this.connectionWithOthersScale = i + 1;
        this.selectedImage = i;
    }

    tuningWithPeopleScale: number = 4;
    lonelinessScale: number = 4;
    happinessScale: number = 4;

    feelingsRange: Options = {
        floor: 1,
        ceil: 7,
        showSelectionBar: true,
        selectionBarGradient: {
            from: 'white',
            to: '#e31d93'
        },
        getPointerColor: (value: number): string => {
            return '#6f2277';
        }
    };

    data: {
        age: Number,
        gender: String,
        connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: Number,
        lonelinessScale: Number
    };
    clientId: String = "free-tablet";
    private header: { "client-id": String };
    showMsg: boolean;
    target: HTMLElement;


    constructor(private dataSvc: DataService, private router: Router) {
    }

    ngOnInit() {
        const tablet = JSON.parse(localStorage.getItem('tablet'));
        if (tablet) {
            this.clientId = tablet.tabletId;
        }

    }
    isKima() {
        console.log(this.clientId)
        return this.clientId.includes('entrance') || this.clientId.includes('exit');
    }
    isSymbiosis() {
        console.log(this.clientId)
        return this.clientId.match(/tablet-\d+/g);
    }

    sendData() {

        this.data = {
            "age": this.age,
            "gender": this.gender,
            "connectionWithOthersScale": this.connectionWithOthersScale,
            "tuningWithPeopleScale": this.tuningWithPeopleScale,
            "lonelinessScale": this.lonelinessScale,
            "happinessScale": this.happinessScale
        };

        this.header = {"client-id": this.clientId};
        this.isLoading = true;
        this.dataSvc.sendPreQuestionnair(this.data, this.header).subscribe(res => {


            this.isLoading = false;

            if (this.MyProp) {
                this.MyProp.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            if (this.isSymbiosis()) {
                this.router.navigate(['waiting-video']);
            }

            if (this.isKima()) {
                this.router.navigate(['kima-thankyou']);
            }


/*            let showMessageInterval = setInterval(() => {

                this.showMsg = false;
                if (!this.isKima()) {
                    clearInterval (showMessageInterval);
                    this.router.navigate(['waiting-video']);
                }
            }, 3000);*/

            console.log("logging result");
            console.log(res);
        }, error => {
            this.isLoading = false;
            console.log("logging error");
            console.log(error);
        });
    }


}
