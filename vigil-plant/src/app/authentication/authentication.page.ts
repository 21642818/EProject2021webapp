import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})

export class AuthenticationPage implements OnInit {
  url: string; // The URL we're at: login, signup, or reset.
  pageTitle = 'Sign In';
  actionButtonText = 'Sign In';
  constructor(private readonly router: Router, private readonly auth: AuthenticationService ) {}
  
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
    try {
      await this.auth.login(email, password);
      // This will give you an error since we don't have the / URL in our routes yet.
      // No worries, we'll add it soon enough.
      this.router.navigateByUrl('home');
    } catch (error) {
        console.log('Either we couldn`t find your user or there was a problem with the password');
    }
  }
  async signup(email: string, password: string) {
    // This will hold the logic for the signup function.
    try {
      await this.auth.signup(email, password);
      this.router.navigateByUrl('home');
    } catch (error) {
      console.log(error);
    };
  }
  async resetPassword(email: string) {
    // This will hold the logic for the resetPassword function.
    try {
      await this.auth.resetPassword(email);
      console.log('Email Sent');
      this.router.navigateByUrl('login')
    } catch (error) {
      console.log('Error: ', error)
    }
  }
}
