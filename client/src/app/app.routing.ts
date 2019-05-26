import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PreQuestionaireComponent} from "./components/pre-questionaire/pre-questionaire.component";
import {PostQuestionaireComponent} from "./components/post-questionaire/post-questionaire.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {AdminComponent} from "./components/admin/admin.component";
import {FirstRunComponent} from "./components/first-run/first-run.component";
import {VideoComponent} from "./components/video/video.component";
import {KimaThankyouComponent} from "./components/kima-thankyou/kima-thankyou.component";
import {ThankYouComponent} from "./components/thank-you/thank-you.component";
/**
 * Created by bisho on 14/04/2019.
 */

const appRouting: Routes = [
    {path: 'pre-quest', component: PreQuestionaireComponent},
    {path: 'post-quest', component: PostQuestionaireComponent},
    {path: 'admin', component: AdminComponent},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'first', component: FirstRunComponent},
    {path: 'waiting-video', component: VideoComponent},
    {path: 'kima-thankyou' , component: KimaThankyouComponent},
    {path: '', redirectTo: 'pre-quest', pathMatch: 'full'},
    {path: 'thank-you' , component: ThankYouComponent}
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRouting)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {

}
