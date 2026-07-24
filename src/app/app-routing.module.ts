import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePageComponent } from './pages/home/home-page.component';
import { PracticePageComponent } from './pages/practice/practice-page.component';
import { TrainingHubComponent } from './pages/training/training-hub/training-hub.component';
import { DrillPlayerComponent } from './pages/training/drill-player/drill-player.component';
import { MethodPageComponent } from './pages/method/method-page.component';
import { HistoryComponent } from './pages/history/history.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'practica', component: PracticePageComponent },
  { path: 'entrenar', component: TrainingHubComponent },
  { path: 'entrenar/:id', component: DrillPlayerComponent },
  { path: 'metodo', component: MethodPageComponent },
  { path: 'historial', component: HistoryComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
