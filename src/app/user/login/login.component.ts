import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private auth: AngularFireAuth) {}
  showAlert: boolean = false;
  alertMsg = 'Please wait! Your account is being created';
  alertColor = 'blue';
  isSubmission = false
  credentails = {
    email: '',
    password: '',
  };

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are logging you in.';
    this.alertColor = 'blue';
    this.isSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentails.email,
        this.credentails.password
      );
    } catch (error) {
      this.alertMsg = 'Invalid email or password!';
      this.alertColor = 'red'
      this.isSubmission = false
      return 
    }

    this.alertMsg = 'Success! You are now logged in.'
    this.alertColor = 'green'
  }
}
