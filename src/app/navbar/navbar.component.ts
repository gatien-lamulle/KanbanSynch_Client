import { ComponentType } from "@angular/cdk/portal";
import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "../login/login.component";
import { SignupComponent } from "../signup/signup.component";
import { ProfileComponent } from "../profile/profile.component";
import { KanbanService } from "../services/kanban.service";
import { UsersService } from "../services/users.service";
import { FormControl } from "@angular/forms";
import { startWith, debounceTime, distinctUntilChanged, map, filter, switchMap, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import { Router } from "@angular/router";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";


/**
 * Verifier ajout guest + enlever de l'autocomplete les deja guest et creator + CSS Snackbar
 */

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  isPublic: Boolean = false;
  owner: {username: String, email: String} | null = null;
  guestsControl: FormControl = new FormControl();
  possiblesGuests!: Observable<any[]>;
  guests!: {username: String, email: String}[]

  @Input()
  kanbanId: any = null;

  constructor(
    public dialog: MatDialog,
    public userService: UsersService,
    private kanbanService: KanbanService,
    private guestSnackbar: MatSnackBar,
    public router: Router
  ) {}

  ngOnInit(): void {
    console.log("init navbar");
    console.log(this.userService.user.username);
    console.log(this.kanbanId);
    this.userService.checkToken();

    this.refresh();

  }

  amIOwner() {
    return this.owner && this.userService.user.username && (this.owner.username === this.userService.user.username)
  }

  async refresh() {
    console.log("refresh");

    this.kanbanService.getKanban(this.kanbanId).subscribe((res: any) => {
      console.log('getKanban',res);
      this.isPublic = res.data.kanban.public;
      this.owner = res.data.kanban.creator;
      this.guests = [...res.data.kanban.guests]
    }, (err) => {
      // console.error(err);
      // GERER L'EREUR REDIRRECTION OU AUTRE !!!!!!!!!!!!!!!
    });


    this.possiblesGuests = this.guestsControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      filter(e => (e.length > 2 && e !== this.owner?.username)),
      switchMap(val => {
        return this.userService.searchUser(val);
      }),
      tap(e => console.log(e)),
      map(val => {
        return val.filter(e => (e !== this.owner?.username && !this.guests.some(g => g.username === e)))
      }),
      tap(e => console.log(e)),
    )
  }

  async addGuest() {
    console.log('add', this.guestsControl.value);
    if (!this.amIOwner() || !this.guestsControl.value || this.guestsControl.value.length < 4 || this.guestsControl.value === this.owner?.username
      || this.guests.some(e => e.username === this.guestsControl.value)) {
        return;
    }
    this.kanbanService.addGuest(this.guestsControl.value).subscribe((res: any) => {
      console.log(res);
      this.guestsControl.setValue('');
      this.guests.push(res.data.addGuest);
    }, err => {
      if (err.message.includes('violates foreign key constraint')) {
        this.guestSnackbar.open("User doesn't exists", "OK", {horizontalPosition: 'center', verticalPosition: 'top', duration: 3000, panelClass: 'snack-guest'});
      }
    });

  }

  userConnected() {
    return this.userService.user.exist;
  }

  signout() {
    this.userService.signout();
    this.router.navigate(["/home"]);
  }

  openDialog(type: String = "signup") {
    console.log("openDialog");

    const componentDialog: any = type === "signup"
      ? SignupComponent
      : (type === "login" ? LoginComponent : (type === 'profile' ? ProfileComponent : null));
    if (!componentDialog) return;
    const dialogRef = this.dialog.open(componentDialog, {
      width: type === 'profile' ? "800px" : "600px",
      autoFocus: false,
      // height: '700px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'connected') {
        this.refresh();
      }
      else if (result) {
        this.openDialog(result);
      }
    });
  }

  async updatePublicKanban() {
    console.log(this.isPublic);
    if (this.isPublic || await this.openConfirmationDialog("Are you sure you want to pass your kanban in private ? It will remove all the guests.")) {
      this.kanbanService.publicKanbanToggle(this.isPublic).subscribe(
        (res: any) => {
          if (!this.isPublic) {
            for (let guest of this.guests) {
              this.removeGuest(guest.username);
            }
          }
          console.log("toggle:", res);
          this.isPublic = res.data.setPublic.public;
        },
        (err) => {
          console.error(err);
          // GERER L'EREUR REDIRRECTION OU AUTRE !!!!!!!!!!!!!!!
        },
      );
    } else {
      this.isPublic = true;
    }
  }

  removeGuest(username: String) {
    console.log(username);
    this.kanbanService.removeGuest(username, this.kanbanId).subscribe(_ => {
      this.guests = this.guests.filter(e => e.username !== username);
    })
  }

  myKanbanPage() {
    this.router.navigate(['/kanbans'], {state: {username: this.userService.user?.username}});
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
}
