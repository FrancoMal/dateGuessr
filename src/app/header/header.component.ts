import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Theme, ThemeService } from '../core/services/theme.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  theme: Theme = 'dark';

  readonly navItems: NavItem[] = [
    { path: '/', label: 'Inicio', icon: '🏠', exact: true },
    { path: '/practica', label: 'Práctica', icon: '📅', exact: false },
    { path: '/entrenar', label: 'Entrenar', icon: '🏋️', exact: false },
    { path: '/metodo', label: 'Método', icon: '📖', exact: false },
    { path: '/historial', label: 'Historial', icon: '📊', exact: false }
  ];

  private sub!: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe(theme => (this.theme = theme));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
