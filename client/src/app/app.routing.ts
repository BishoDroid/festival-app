import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PreQuestionaireComponent} from "./components/pre-questionaire/pre-questionaire.component";
import {PostQuestionaireComponent} from "./components/post-questionaire/post-questionaire.component";
/**
 * Created by bisho on 16/12/2018.
 */

const appRouting: Routes = [
    {path: 'pre-quest', component: PreQuestionaireComponent},
    {path: 'post-quest', component: PostQuestionaireComponent},
    {path: 'dashboard', component: DashboardComponent}
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
