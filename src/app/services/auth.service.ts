import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import IUser from '../models/user.model';
import { Observable, delay, map, filter, switchMap, of } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuthenticated$: Observable<boolean> = new Observable();
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.usersCollection = db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(
      map((currentUser) => Boolean(currentUser))
    );
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events
      .pipe(
        filter((event) => {
          return event instanceof NavigationEnd;
        }),
        map((event) => this.route.firstChild),
        switchMap((route) => route?.data ?? // creating a new observable using of operator
        of({}))
      )
      .subscribe((data) => {
        this.redirect = data['authOnly'] ?? false;
      });
  }

  public async createUser(userData: IUser) {
    const { email, password, name, phoneNumber, age } = userData;
    if (!password) {
      throw new Error('Password not provided!');
    }
    const userCred = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );

    if (!userCred.user) {
      throw new Error('User can`t be found');
    }

    await this.usersCollection.doc(userCred.user.uid).set({
      email: email,
      name: name,
      phoneNumber: phoneNumber,
      age: age,
    });

    await userCred.user.updateProfile({
      displayName: userData.name,
    });
  }

  public async logout($event: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();

    if(this.redirect){
      await this.router.navigateByUrl('/');
    }
  }
}
