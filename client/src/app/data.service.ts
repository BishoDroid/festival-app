import {Injectable, isDevMode} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/index";
/**
 * Created by bisho on 14/04/2019.
 */

@Injectable()
export class DataService {


   //  host: string = isDevMode() ? 'http://localhost:3001' : 'http://167.99.85.162';
    host: string = 'http://localhost:3001' ;

    constructor(private http: HttpClient) {

    }

    sendPreQuestionnair(data: any, header: any): Observable<any> {
        return this.http.post(this.host + '/api/user/pre-quest', data, {headers: header});
    }

    sendPostQuestionnair(data: any, header: any): Observable<any> {
        return this.http.post(this.host + '/api/user/post-quest', data, {headers: header});
    }

    getActiveSessions(): Observable<any> {
        return this.http.get(this.host + '/api/sessions/active');
    }

    getAllSessions(): Observable<any> {
        return this.http.get(this.host + '/api/sessions/all');
    }

    startRecording(header: any): Observable<any> {
        return this.http.get(this.host + '/api/kima/start', {headers: header});
    }

    stopRecording(header: any): Observable<any> {
        return this.http.get(this.host + '/api/kima/stop', {headers: header});
    }

    removeSession(header: any): Observable<any> {
        return this.http.post(this.host + '/api/user/remove', null, {headers: header});
    }

    getTablets(type: string): Observable<any> {
        return this.http.get(this.host + '/api/admin/tablets/' + type);
    }

    saveTablet(tablet: any): Observable<any> {
        return this.http.post(this.host + '/api/admin/tablets/' + tablet.type, tablet);
    }

    resetTablets(): Observable<any> {
        return this.http.get(this.host + '/api/admin/tablets/reset/all');
    }

    resetTabletById(tabletId: string): Observable<any> {
        return this.http.put(this.host + '/api/admin/tablets/reset/' + tabletId, {});
    }

    updatePassword(header: any, body: any): Observable<any> {
        return this.http.put(this.host + '/api/admin/config/password', body, {headers: header});
    }

    updateFirstRun(header: any, body: any): Observable<any> {
        return this.http.put(this.host + '/api/admin/config/is-first-run', body, {headers: header});
    }

    savePassword(header: any, password64: any): Observable<any> {
        return this.http.post(this.host + '/api/admin/config/password', password64, {headers: header});
    }

    isFirstRun(): Observable<any> {
        return this.http.get(this.host + '/api/admin/config/is-first-run', {headers: {"client-id": "free-tablet"}});
    }

    getLogs(filter: string): Observable<any> {
        return this.http.get(this.host + '/api/logs?' + filter);
    }
}
