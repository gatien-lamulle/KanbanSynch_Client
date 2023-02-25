import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "../services/users.service";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  profileEmailForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
  })

  profilePassForm = new FormGroup({
    currentPassword: new FormControl("", [Validators.required]),
    newPassword: new FormControl("", [Validators.required]),
  })

  info = '';

  constructor(
    private userService: UsersService,
  ) { }

  ngOnInit(): void {
  }

  changeEmail() {
    this.userService.changeEmail(
      this.profileEmailForm.get("email")?.value,
    ).subscribe((res: any) => {
      console.log(res);
      this.info = res.data.changeEmail;
      if (res.data.changeEmail.includes("duplicate")) {
        this.info = "Email already used by another account"
      } else {
        this.info = res.data.changeEmail;
      }
    })
  }

  changePassword() {
    this.userService.changePassword(
      this.profilePassForm.get("currentPassword")?.value,
      this.profilePassForm.get("newPassword")?.value,
    ).subscribe((res: any) => {
      console.log(res);
      this.info = res.data.changePassword;
    })
  }

}
