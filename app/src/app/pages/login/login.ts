import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  showPw = false;

  togglePw() {
    this.showPw = !this.showPw;
  }

  doLogin() {
    // hier später die Login-Logik
    console.log('login', this.username);
  }
}
