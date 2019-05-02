import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {RequestOptions} from "@angular/http";
/**
 * Created by bisho on 14/04/2019.
 */

@Injectable()
export class DataService {



    constructor(private http: HttpClient) {

    }

    sendPreQuestionnair(data: any, header: any): Observable<any> {
        return this.http.post('http://localhost:3001/api/user/pre-quest', data, {headers: header});
    }

    sendPostQuestionnair(data: any, header: any): Observable<any> {
        return this.http.post('http://localhost:3001/api/user/post-quest', data, {headers: header});
    }

    getActivePairs(): Observable<any> {
        return this.http.get('http://localhost:3001/api/pairs/all');
    }

    startRecording(header: any): Observable<any> {
        return this.http.get('http://localhost:3001/api/kima/start', {headers: header});
    }

    stopRecording(header: any): Observable<any> {
        return this.http.get('http://localhost:3001/api/kima/stop', {headers: header});
    }

    removePair(header: any): Observable <any> {
        return this.http.post('http://localhost:3001/api/user/remove', null , {headers: header});
    }
}
