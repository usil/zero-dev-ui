import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
  title = 'template-dashboard';
}
