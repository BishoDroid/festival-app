import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PreQuestionaireComponent} from "./components/pre-questionaire/pre-questionaire.component";
import {PostQuestionaireComponent} from "./components/post-questionaire/post-questionaire.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {AdminComponent} from "./components/admin/admin.component";
import {FirstRunComponent} from "./components/first-run/first-run.component";
import {VideoComponent} from "./components/video/video.component";
import {WaitingComponent} from "./components/waiting/waiting.component";
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
    {path: '', redirectTo: 'pre-quest', pathMatch: 'full'}
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
