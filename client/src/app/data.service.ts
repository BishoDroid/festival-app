import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
/**
 * Created by bisho on 14/04/2019.
 */

@Injectable()
export class DataService {



    constructor(private http: HttpClient) {

    }

    sendPostQuestionnair(data: any) {
        return this.http.post('http://localhost:3001/api/user/pre-quest', data, {headers: {}});
    }
}
