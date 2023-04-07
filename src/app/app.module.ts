import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'; // <-- Importa el módulo de idioma español
import { DateGeneratorComponent } from './date-generator/date-generator.component';
import { DatePipe } from '@angular/common';
import { ExplanationComponent } from './explanation/explanation.component';
import { ProcedureComponent } from './procedure/procedure.component';
import { HeaderComponent } from './header/header.component';

registerLocaleData(localeEs); // <-- Establece el idioma español como idioma por defecto

@NgModule({
  declarations: [
    AppComponent,
    DateGeneratorComponent,
    ExplanationComponent,
    ProcedureComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    // HttpModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
