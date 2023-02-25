import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { fr } from 'date-fns/locale';
import { TasksService } from '../services/tasks.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  constructor(private taskService: TasksService) { }


  ngOnInit(): void {
    this.title = this.task.title;
    this.description = this.task.description;
    this.endDate = this.task.endDate;
    this.holders = this.task.holder;
    if (this.holders.length > 0) {
      this.holdersTooltip = this.holders.map(e => e.username).join("\n")
    }
  }

  @Input()
  task!: any

  title: String = '';

  description: String = '';

  endDate: string = '';

  holders: Array<any> = [];

  holdersTooltip: string = '';

  optionDate = {
    // locale: fr,
    includeSeconds: true,
  }

  @Output()
  removeTaskEvent = new EventEmitter<string>();


  dateIsPast() {
    const currentDate = new Date(this.endDate);
    const now = new Date()
    return currentDate <= now;
  }

  editTask() {
    this.task.edit = true;
  }

  deleteTask() {
    console.log(this.task.idTask);
    this.taskService.removeTask(this.task.idTask).subscribe((result: any) => {
      console.log('Task deleted:', result);
      if (result && result.data.removeTask.idTask) {
        this.removeTaskEvent.emit(result.data.removeTask.idTask)
      }
    });
  }

}
