import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-kima-thankyou',
  templateUrl: './kima-thankyou.component.html',
  styleUrls: ['./kima-thankyou.component.css']
})
export class KimaThankyouComponent implements OnInit {

  constructor( private router: Router) { }

  ngOnInit() {

              let statyInPage = setInterval(() => {
                    this.router.navigate(['pre-quest']);
                clearInterval (statyInPage);
            }, 15000);

  }

}
