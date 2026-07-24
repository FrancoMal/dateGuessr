import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './header/header.component';

// Páginas
import { HomePageComponent } from './pages/home/home-page.component';
import { PracticePageComponent } from './pages/practice/practice-page.component';
import { TrainingHubComponent } from './pages/training/training-hub/training-hub.component';
import { DrillPlayerComponent } from './pages/training/drill-player/drill-player.component';
import { MethodPageComponent } from './pages/method/method-page.component';
import { HistoryComponent } from './pages/history/history.component';

// Componentes compartidos
import { BreakdownPanelComponent } from './shared/components/breakdown-panel/breakdown-panel.component';
import { ModeCardComponent } from './shared/components/mode-card/mode-card.component';
import { StatChipComponent } from './shared/components/stat-chip/stat-chip.component';
import { StreakFlameComponent } from './shared/components/streak-flame/streak-flame.component';
import { ScoreStripComponent } from './shared/components/score-strip/score-strip.component';
import { NumberPadComponent } from './shared/components/number-pad/number-pad.component';
import { WeekdayPadComponent } from './shared/components/weekday-pad/weekday-pad.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomePageComponent,
    PracticePageComponent,
    TrainingHubComponent,
    DrillPlayerComponent,
    MethodPageComponent,
    HistoryComponent,
    BreakdownPanelComponent,
    ModeCardComponent,
    StatChipComponent,
    StreakFlameComponent,
    ScoreStripComponent,
    WeekdayPadComponent,
    NumberPadComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    AppRoutingModule
  ],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
