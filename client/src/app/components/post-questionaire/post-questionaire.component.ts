import {Component, OnInit} from "@angular/core";
import {Options} from "ng5-slider";
import {DataService} from "../../data.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-post-questionaire',
    templateUrl: './post-questionaire.component.html',
    styleUrls: ['./post-questionaire.component.css', '../../app.component.css']
})
export class PostQuestionaireComponent implements OnInit {
     isError: boolean;
     msg: string;
    //selectedImage: number = 0;

    constructor(private dataSvc: DataService, private router: Router) {
    }

    connectednessWithOthers: any = ['11.png', '22.png', '33.png', '44.png', '55.png', '66.png', '77.png'];
    selectedImage = 0;
    singingPartnerFamiliarity = 'yes';
    symbiosisRoomFamiliarity = 'one';
    tuningWithPeopleScale = 4;
    lonelinessScale = 4;
    happinessScale = 4;
    connectionWithOthersScale = 1;

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
        singingPartnerFamiliarity: string,
        symbiosisRoomFamiliarity: string,
        connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: number,
        lonelinessScale: number
    };
    clientId: string = "free-tablet";
   // clientId: string;
    private header: { "client-id": String };
    showMsg: boolean;


    onImageClick(i: number, imagePath: String) {
        this.connectionWithOthersScale = i + 1;
        this.selectedImage = i;
    }

    ngOnInit() {
        const tablet = JSON.parse(localStorage.getItem('tablet'));
        if (tablet) {
            this.clientId = tablet.tabletId;
        }

        console.log('Im on!!');
    }

    isKima() {
        console.log(this.clientId)
        return this.clientId.includes('entrance') || this.clientId.includes('exit');
    }

    sendData() {
        this.isError = false;
        this.data = {
            "connectionWithOthersScale": this.connectionWithOthersScale,
            "singingPartnerFamiliarity": this.singingPartnerFamiliarity,
            "symbiosisRoomFamiliarity": this.symbiosisRoomFamiliarity,
            "tuningWithPeopleScale": this.tuningWithPeopleScale,
            "lonelinessScale": this.lonelinessScale,
            "happinessScale": this.happinessScale
        };
        this.header = {"client-id": this.clientId};
        this.dataSvc.sendPostQuestionnair(this.data, this.header).subscribe(res => {
            console.log(res);
            this.router.navigate(['thank-you']);
            console.log(res);
        }, error => {
            this.msg = 'ERROR: ' + error.error;
            this.isError = true;
            this.showMsg = true;
            console.log("logging error");
            console.log(error);
            console.log(error);
        });
    }

}
