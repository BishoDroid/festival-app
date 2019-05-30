import { Component, OnInit } from '@angular/core';
import {Router, RoutesRecognized, NavigationEnd } from "@angular/router";


@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent implements OnInit {
  private clientId: string ;

  constructor(private router: Router) {


  }

  ngOnInit() {

    const tablet = JSON.parse(localStorage.getItem('tablet'));
    if (tablet) {
      this.clientId = tablet.tabletId;
    }
    let statyInPage = setInterval(() => {

      // this only gets redirected to after a post questionnire
      if (this.isKima() ) { // coming from pre-question
        this.router.navigate(['post-quest']);
      } else if (!this.isKima() ) { // symbiosis
        this.router.navigate(['pre-quest']);
      }
      clearInterval (statyInPage);
    }, 15000);
  }

  isKima() {
    console.log(this.clientId)
    return this.clientId.includes('entrance') || this.clientId.includes('exit');
  }
}
