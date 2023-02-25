import { Component, Input, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { TasksService } from "../services/tasks.service";
import { HolderDialogComponent } from '../holder-dialog/holder-dialog.component';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.css', '../task/task.component.css']
})
export class NewTaskComponent implements OnInit {

  minEndDate: Date = new Date();

  constructor(public dialog: MatDialog, private tasksService: TasksService) {}

  ngOnInit(): void {
    // this.title = this.task.title;
    // this.description = this.task.description;
    // this.endDate = this.task.endDate;
    // this.holders = this.task.holder;
  }

  @Input()
  task!: any

  fieldsErrorMessage = ''

  // title: String = '';

  // description: String = '';

  // endDate: string = '';

  // holders: Array<any> = [];

  holdersTooltip(): string {
    return this.task.holder.map((e: any) => e.username).join("\n");
  }

  editHolders() {
    console.log('dialog');

    this.dialog.open(HolderDialogComponent, {
      width: '250px',
      data: this.task,
      autoFocus: false,
    }).afterClosed().subscribe(res => {
      console.log('close', res);
      if (res) {
        this.task.holder = res;
      }

    });
  }

  validateTask() {
    console.log(this.task.title, this.task.description, this.task.endDate, typeof this.task.endDate);
    if (this.task.title === '') {
      this.fieldsErrorMessage = 'Title is empty';
    } else if (this.task.endDate === null) {
      this.fieldsErrorMessage = 'Date is wrong';
    } else {
      this.fieldsErrorMessage =  '';
      console.log(typeof this.task.endDate, this.task.endDate, new Date(this.task.endDate));
      this.task.endDate = (new Date(this.task.endDate)).toISOString();
      this.task.edit = false;
      this.tasksService.updateTask(this.task).subscribe((result: any) => {
        console.log("tasks updated", result);
      });
    }
  }

}

