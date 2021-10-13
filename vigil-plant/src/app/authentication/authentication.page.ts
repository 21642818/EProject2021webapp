import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})

export class AuthenticationPage implements OnInit {
  url: string; // The URL we're at: login, signup, or reset.
  pageTitle = 'Sign In';
  actionButtonText = 'Sign In';
  constructor(private readonly router: Router) {}
  
  ngOnInit() {
    // First we get the URL, and with that URL we send the
    // proper information to the authentication form component.
    this.url = this.router.url.substr(1);
    if (this.url === 'signup') {
      this.pageTitle = 'Create your Account';
      this.actionButtonText = 'Create Account';
    }
    if (this.url === 'reset') {
      this.pageTitle = 'Reset your Password';
      this.actionButtonText = 'Reset Password';
    }
  }
  
  handleUserCredentials(userCredentials) {
    // This method gets the form value from the authentication component
    // And depending on the URL, it calls the respective method.
    const { email, password } = userCredentials;
    switch (this.url) {
      case 'login':
        this.login(email, password);
        break;
      case 'signup':
        this.signup(email, password);
        break;
      case 'reset':
        this.resetPassword(email);
        break;
    }
  }
  async login(email: string, password: string) {
    // This will hold the logic for the login function.
    console.log(email, password);
  }
  async signup(email: string, password: string) {
    // This will hold the logic for the signup function.
    console.log(email, password);
  }
  async resetPassword(email: string) {
    // This will hold the logic for the resetPassword function.
    console.log(email);
  }
}
