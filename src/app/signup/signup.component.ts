import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "../services/users.service";
import { KanbanService } from "../services/kanban.service";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { TasksService } from "../services/tasks.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  hide: Boolean = true;

  loading: Boolean = false;

  signupForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required]),
  });

  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SignupComponent>,
    private userService: UsersService,
    private kanbanService: KanbanService,
    private tasksService: TasksService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
  }

  openLogin() {
    this.dialogRef.close("login");
  }

  async openConfirmationDialog(message: String): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "350px",
      data: message,
      disableClose: true,
    });

    const result = await dialogRef.afterClosed().toPromise();
    return result;
  }

  signup() {
    this.loading = true;
    this.userService.signup(
      this.signupForm.get("username")?.value,
      this.signupForm.get("email")?.value,
      this.signupForm.get("password")?.value,
    ).subscribe((res: any) => {
      this.loading = false;
      const result = {token: res.data.signup};
      if (result.token.toLowerCase().includes("error")) {
        this.error = res.data.signup;
      } else {
        localStorage.setItem("userToken", result.token);
        this.kanbanService.getKanban().subscribe(async (res2: any) => {
          console.log(res2);
          const ownerKanban = res2.data.kanban.creator;
          console.log("ownerKanban:", ownerKanban);
          if (!ownerKanban) {
            //POPUP Demaner si sauvergarder le kanban courrant Si oui ajouter l'user comme owner du kanban sinon :
            this.kanbanService.setOwner();
            this.error = null;
            this.dialogRef.close("connected");
            this.userService.checkToken();
            this.tasksService.getAllTasks(this.kanbanService.kanbanId!);
            this.router.navigate(["/kanbans"], {
              state: { username: this.userService.user?.username },
            });
          } else {
            this.error = null;
            this.dialogRef.close("connected");
            this.userService.checkToken();
            this.router.navigate(["/kanbans"], {
              state: { username: this.userService.user?.username },
            });
          }
        });
      }
    }, (err) => {
      this.loading = false;
      console.log(err.message, typeof err);
      if (err.message.includes("duplicate key")) {
        this.error = "Username already exists";
        this.signupForm.controls.username.setErrors({ "incorrect": true });
      } else {
        this.error = err;
      }
    });
  }
}
