import {
  Component,
  Inject,
  OnInit,

} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { KanbanService } from "../services/kanban.service";
import { UsersService } from "../services/users.service";

@Component({
  selector: "app-my-kanbans",
  templateUrl: "./my-kanbans.component.html",
  styleUrls: ["./my-kanbans.component.css"],
})
export class MyKanbansComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private kanbanService: KanbanService,
    private userService: UsersService,
  ) {
  }

  ngOnInit(): void {

    this.userService.checkToken().then(() => {
      this.username = this.userService.user.username as string;
      this.kanbanService.getGuestedKanbans(this.username).subscribe(
        (result: any) => {
          console.log(result.data.kanbans);

          this.myGuestedKanban = result.data.kanbans;
        },
      );
      this.kanbanService.getOwnerKanbans(this.username).subscribe((result: any) => {
        console.log(result.data.kanbans, 'own');

        this.ownKanban = result.data.kanbans;
      });
    });


  }

  removeKanban(ev: MouseEvent, id: String) {
    console.log("remove", id);
    this.openConfirmationDialog(`All related information will be lost ! Are you sure you want to delete this kanban ?`).then(res => {
      if (res) {
        this.kanbanService.removeKanban(id).subscribe(_ => {
          this.ownKanban = this.ownKanban.filter((e: any) => e.idKanban !== id);
          if (this.ownKanban.length === 0) {
            localStorage.removeItem("myKanban");
          }
        });
      }
    })

  }

  removeGuest(ev: MouseEvent, id: String) {
    console.log("remove guest", id);
    this.openConfirmationDialog(`Are you sure you want to leave this kanban ?`).then(res => {
      if (res) {
        this.kanbanService.removeGuest(this.username ,id).subscribe(_ => {
          this.myGuestedKanban = this.myGuestedKanban.filter((e: any) => e.idKanban !== id);
        });
      }
    })

  }

  addNewKanban(e: MouseEvent) {
    this.kanbanService.createNewKanban("New Kanban", this.username).then((id: any) => {
      console.log(id);
      if (this.ownKanban.length === 0) {
        localStorage.setItem("myKanban", id);
      }
      this.ownKanban = [{idKanban: id, name: "New Kanban", creator: this.username}, ...this.ownKanban];
    });
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


  username: String = "";

  myGuestedKanban: any[] = [];
  ownKanban: any = [];
}
