import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private apollo: Apollo) { }

  user: {
    exist: boolean
    username: string | undefined | null
  } = {exist: false, username: null};

  signout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('myKanban');
    this.user = {exist: false, username: null};
  }

  signup(username: string, email: string, password: string) {
    console.log(username, email, password);

    return this.apollo.mutate({
      mutation: gql`mutation{
        signup(username: "${username}", email: "${email}", password: "${password}")
      }`
    });

  }

  login(username: string, password: string) {
    console.log(typeof username, username, typeof password, password);

    return this.apollo.mutate({
      mutation: gql`mutation {
        login(username: "${username}", password: "${password}")
      }`
    });
  }

  changeEmail(email: string) {
    console.log(email);

    return this.apollo.mutate({
      mutation: gql`mutation {
        changeEmail(email: "${email}")
      }`
    });

  }

  changePassword(oldPassword: string, newPassword: string) {
    console.log(oldPassword, newPassword);

    return this.apollo.mutate({
      mutation: gql`mutation {
        changePassword(oldPassword: "${oldPassword}", newPassword: "${newPassword}")
      }`
    });

  }

  checkToken(): any {
    const token = localStorage.getItem('userToken');
    console.log(token);

    if (!token) {
      this.user = {exist: false, username: null};
      return;
    }

    return new Promise((resolve, reject) => {
      this.apollo.watchQuery({
        query: gql`query{
          token {
            exist
            username
          }
        }`, fetchPolicy: 'network-only'
      }).valueChanges.subscribe((res: any) => {
        console.log('user', res.data.token);
        this.user = res.data.token;
        if (!this.user.exist) {
          localStorage.removeItem('userToken');
        }
        resolve(null);
      });
    });
  }

  searchUser(username: String): Observable<any[]> {
    console.log('send', username);

    return this.apollo.watchQuery({
      query: gql`query{
        username(username: "${username}")
      }`
    }).valueChanges.pipe(
      map((val: any): any[] => {
        return val.data.username;
      }),
    );
  }


}
