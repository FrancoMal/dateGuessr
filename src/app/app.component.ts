import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Inyectar el ThemeService acá garantiza que el tema se aplique al arrancar.
  constructor(private themeService: ThemeService) {}
}
