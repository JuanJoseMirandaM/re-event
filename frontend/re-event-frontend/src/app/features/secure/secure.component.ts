import { ChangeDetectionStrategy, Component } from '@angular/core';
import {HeaderComponent} from '../header/header.component';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';

@Component({
  selector: 'app-secure',
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent
  ],
  templateUrl: './secure.component.html',
  styleUrl: './secure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class SecureComponent {

}
