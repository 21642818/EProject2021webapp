import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})

export class AuthenticationPage implements OnInit {
  url: string; // The URL we're at: login, signup, or reset.
  pageTitle = 'Sign In';
  actionButtonText = 'Sign In';
  constructor(private readonly router: Router, private readonly auth: AuthenticationService, private alertController: AlertController) {} 
  
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
      this.router.navigateByUrl('tabs');
    } catch (error) {
      this.loginAlert()
      console.log('Either we couldn`t find your user or there was a problem with the password');
    }
  }
  async signup(email: string, password: string) {
    // This will hold the logic for the signup function.
    try {
      await this.auth.signup(email, password);
      this.signupOkAlert()
      //this.router.navigateByUrl('login');
    } catch (error) {
      this.signupAlert()
      console.log(error);
    };
  }
  async resetPassword(email: string) {
    // This will hold the logic for the resetPassword function.
    try {
      await this.auth.resetPassword(email);
      console.log('Email Sent');
      this.resetOKAlert()
    } catch (error) {
      this.resetAlert()
      console.log('Error: ', error)
    }
  }

  async loginAlert() {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: 'Password Error',
      message: 'Either we couldn`t find your user or there was a problem with the password',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async resetAlert() {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: 'Password Reset Error',
      message: 'It seems that this account doesn`t exists. Try creating an account.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.router.navigateByUrl('login')
  }

  async signupAlert() {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: 'Signup Error',
      message: 'It seems that this account already exists. Try resetting your password.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.router.navigateByUrl('login')
  }

  async resetOKAlert() {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Success',
      subHeader: 'Password Reset',
      message: 'Email sent with password reset link.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.router.navigateByUrl('login')
  }

  async signupOkAlert() {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Success',
      subHeader: 'Signup',
      message: 'Signup was successful, Returning to the login page.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
    this.router.navigateByUrl('login')
  }
}
