import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <app-explanation></app-explanation>
    <app-date-generator id="app-date-generator"></app-date-generator>
  `
})
export class HomeComponent {}
