import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MyKanbansComponent } from './my-kanbans/my-kanbans.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'kanbans', component: MyKanbansComponent},
  {path: '**', redirectTo: 'home'},
  {path: '', redirectTo: 'home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
