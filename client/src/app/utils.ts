import {HttpHeaders} from '@angular/common/http';
/**
 * Created by bisho on 31/05/2017.
 */
export class Utils {
  /**
   * Get auth headers
   * @returns {Headers}
   */
  public static getAuthHeader(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik56VkNNakJDTWtOQ1JEazRSVVF4TWtGRU56YzNSakpDTURoRlJqZEZNMFV4TWpFeU5qUXdOQSJ9.eyJpc3MiOiJodHRwczovL2Jpc2hvZHJvaWQuZXUuYXV0aDAuY29tLyIsInN1YiI6IjNKUDJCc1hEalcwUnVUWFFGMFQ3UHIxbEFzTHBNOHM3QGNsaWVudHMiLCJhdWQiOiJodHRwOi8vYmlzaG9kcm9pZDozMDAxL2FwaSIsImlhdCI6MTU1MjQ4NjQxMywiZXhwIjoxNTU1MDc2NDEzLCJhenAiOiIzSlAyQnNYRGpXMFJ1VFhRRjBUN1ByMWxBc0xwTThzNyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.lnlOCFWKqlErFOo8pgTmsFWlok5rTN1lQdlhpEvWywNchWZKMUmkwGE7cFs23dHanOsJvq9C9Av3Xl5TX5VRSJ6T6Y2-fn9rEqjs-LQdE6zZvDeqeEyWwEF25CD4wFBZzQNoBZWFnX9qyObsKnOYqC3DrxpT_0P5Iq39XtELvrxC-JnZKyVkNWXV2oPLyNZp0ToyGcDD8peZMURUQD717iSvvv6PvzKID0_88NgpNYXcQounLKJph3LvqktvZ3UuqWnztpT9Zk3G9pn0nArJ2ShbaUY1kfr1XG79TfyWvCBdfOuHHBzbc1a5n07niHU_X2CUNGf7QsNt-_idWfECWw',
      'Content-Type': 'application/json'
    });
  }
}
