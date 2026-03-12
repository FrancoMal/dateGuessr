import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { DateGeneratorComponent } from './date-generator/date-generator.component';
import { DatePipe } from '@angular/common';
import { ExplanationComponent } from './explanation/explanation.component';
import { ProcedureComponent } from './procedure/procedure.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { HistoryComponent } from './components/history/history.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    DateGeneratorComponent,
    ExplanationComponent,
    ProcedureComponent,
    HeaderComponent,
    HomeComponent,
    HistoryComponent,
    ScoreboardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonModule,
    AppRoutingModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
