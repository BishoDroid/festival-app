import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {HttpClientModule} from "@angular/common/http";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {AppRoutingModule} from "./app.routing";
import {PreQuestionaireComponent} from "./components/pre-questionaire/pre-questionaire.component";
import {PostQuestionaireComponent} from "./components/post-questionaire/post-questionaire.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {DataService} from "./data.service";
import { Ng5SliderModule } from 'ng5-slider';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatRadioModule} from '@angular/material';
import { AdminComponent } from './components/admin/admin.component';
import { TabletsFilterPipe } from './tablets.filter.pipe';
import { FirstRunComponent } from './components/first-run/first-run.component';

@NgModule({
    declarations: [
        AppComponent,
        PreQuestionaireComponent,
        PostQuestionaireComponent,
        DashboardComponent,
        AdminComponent,
        TabletsFilterPipe,
        FirstRunComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        NgbModule,
        Ng5SliderModule,
        BrowserAnimationsModule,
        MatButtonModule, MatCheckboxModule, MatRadioModule
    ],
    providers: [DataService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
