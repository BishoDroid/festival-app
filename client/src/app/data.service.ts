import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

/**
 * Created by bisho on 14/04/2019.
 */

@Injectable()
export class DataService {



    constructor(private http: HttpClient) {

    }

    sendPreQuestionnair(data: any): Observable<any> {
        return this.http.post('http://localhost:3001/api/user/pre-quest', data, {headers: {"client-id" : "client-1"}});
    }

    sendPostQuestionnair(data: any): Observable<any> {
        return this.http.post('http://localhost:3001/api/user/post-quest', data, {headers: {"client-id" : "client-1"}});
    }
}
