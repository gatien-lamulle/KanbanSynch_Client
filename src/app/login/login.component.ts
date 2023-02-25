import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { KanbanService } from '../services/kanban.service';
import { Router } from '@angular/router';
import { TasksService } from '../services/tasks.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  hide: Boolean = true;

  loading: Boolean = false;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  })

  error: string | null = null

  constructor(public dialogRef: MatDialogRef<LoginComponent>, private userService: UsersService, private kanbanService: KanbanService, private tasksService: TasksService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openSignup() {
    console.log('form',this.loginForm.controls);

    this.dialogRef.close('signup');
  }

  async openConfirmationDialog(message: String): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: message,
      disableClose: true
    });

    const result = await dialogRef.afterClosed().toPromise();
    return result;
  }

  async login() {
    this.loading = true;
    this.userService.login(this.loginForm.get('username')?.value, this.loginForm.get('password')?.value)
    .subscribe(async (res: any) => {
      console.log(res);
      const result = JSON.parse(res.data.login);
      console.log('login', res);
      this.loading = false;
      if (result.err) {
        this.error = result.err;
      } else {
        console.log(result);
        localStorage.setItem('userToken', result.token)
        console.log('localstorage', localStorage.getItem('userToken'));
        if (!result.kanban.includes(localStorage.getItem('myKanban'))) {
          //A FAIRE
          this.kanbanService.getKanban().subscribe(async (res2: any) => {
            console.log(res2);
            const ownerKanban = res2.data.kanban.creator;
            console.log("ownerKanban:", ownerKanban);
            if (!ownerKanban) {
              //POPUP Demaner si sauvergarder le kanban courrant Si oui ajouter l'user comme owner du kanban sinon :
              if (result.kanban.length === 0 || await this.openConfirmationDialog("Do you want add the current offline kanban to your kanbans ?")) {
                this.kanbanService.setOwner();
                this.error = null;
                this.dialogRef.close('connected');
                this.userService.checkToken();
                this.tasksService.getAllTasks(this.kanbanService.kanbanId!);
                this.router.navigate(['/kanbans'], {state: {username: this.userService.user?.username}});
              } else {
                this.kanbanService.removeKanban().subscribe(_ => {
                  localStorage.setItem('myKanban', result.kanban);
                  this.kanbanService.hasKanban().subscribe();
                  this.router.navigate(['/kanbans'], {state: {username: this.userService.user?.username}});
                  this.error = null;
                  this.dialogRef.close('connected');
                  this.userService.checkToken();
                  this.tasksService.getAllTasks(this.kanbanService.kanbanId!);
                  this.router.navigate(['/kanbans'], {state: {username: this.userService.user?.username}});
                });
              }

            } else {
              localStorage.setItem('myKanban', result.kanban);
              this.kanbanService.hasKanban().subscribe();
              this.error = null;
              this.dialogRef.close('connected');
              this.userService.checkToken();
              this.tasksService.getAllTasks(this.kanbanService.kanbanId!);
              this.router.navigate(['/kanbans'], {state: {username: this.userService.user?.username}});
            }
          });

        } else {
          this.error = null;
          this.dialogRef.close('connected');
          this.userService.checkToken();
          this.tasksService.getAllTasks(this.kanbanService.kanbanId!);
          this.router.navigate(['/kanbans'], {state: {username: this.userService.user?.username}});
        }



        // this.router.navigate([this.router.url]);
      }
    });
  }

}
