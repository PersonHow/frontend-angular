// ============================================
// 根組件
// ============================================

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl:'./app.component.html',
  styleUrl:'./app.component.scss'
})
export class AppComponent {
  title = '動態問卷系統';
}
