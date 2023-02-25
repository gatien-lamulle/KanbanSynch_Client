import { Component, OnInit, Inject } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { KanbanService } from "../services/kanban.service";
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-holder-dialog',
  templateUrl: './holder-dialog.component.html',
  styleUrls: ['./holder-dialog.component.css']
})
export class HolderDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<HolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public task: any,
    private kanbanService: KanbanService, private taskService: TasksService) {
  }

  holders: any[] = [];
  taskId: any = null;

  ngOnInit(): void {
    console.log(this.task);

    this.holders = [...this.task.holder]
    this.taskId = this.task.idTask;
    this.kanbanService.getKanban().subscribe((result: any) => {
      this.possibleHolders = result.data.kanban.guests.map((e: any) => e.username);

      if (result.data.kanban.creator) {
        this.possibleHolders.push(result.data.kanban.creator.username)
      }
      console.log(this.possibleHolders);
    },
    err => {
      console.error(err);
      // GERER L'EREUR REDIRRECTION OU AUTRE !!!!!!!!!!!!!!!
    })
  }

  username: string = '';
  possibleHolders: Array<string> = [];

  usernameFormControl = new FormControl('');

  holdersString(): Array<string> {
    return this.holders.map((e: any) => e.username);
  }

  addHolder(e: any) {
    e.stopPropagation();
    if (!this.username || !this.possibleHolders.includes(this.username)) {
      this.usernameFormControl.setErrors({ invalid: true });
      return;
    }
    this.taskService.addHolder(this.taskId, this.username).subscribe(_ => {
      this.holders.push({username: this.username});
      this.username = '';
    })

  }

  removeHolder(username: string) {
    console.log('removeHolder', username);
    this.taskService.removeHolder(this.taskId, this.username).subscribe(_ => {
      this.holders = this.holders.filter((e: any) => e.username !== username);
    })
  }

}
