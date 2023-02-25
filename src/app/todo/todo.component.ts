import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { TasksService } from "../services/tasks.service";

@Component({
  selector: "app-todo",
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.css"],
})
export class TodoComponent implements OnInit {
  constructor(private tasksService: TasksService) {}

  ngOnInit(): void {
    /// Request tasks
    console.log('todoinit');

    if (!this.preview) {
      this.tasksService.tasks.asObservable().subscribe(res => {
        this.tasks = res[this.status]
      });
    }

    this.refreshTasks();
  }

  async refreshTasks() {
    if (this.kanban) {
      this.tasksService.getTasksByStatus(this.kanban, this.status).then((res: any) => {
        this.tasks = res;
      });
      // .subscribe((result: any) => {
      //   this.tasks = result.data.tasks.map((e: any) => {
      //     return {...e, edit: false};
      //   })
      // });
    }
  }

// description: "test numero 2 ! Alors ?"
// endDate: "2021-10-21T22:00:00.000Z"
// holder: Array []
// idTask: "45678"
// status: "INPROGRESS"
// title: "test2"
// edit: true

  @Input()
  title!: string;

  @Input()
  status!: string;

  @Input()
  preview!: boolean;

  _kanban!: string;
  get kanban() {
    return this._kanban;
  }
  @Input() set kanban(value: string) {
    this._kanban = value;
    this.refreshTasks();
  }

  // kanban!: string;

  tasks: Array<any> = [];

  getTasks() {

  }

  addTask() {
    console.log(this.title);
    this.tasks.unshift({
      title: "",
      description: "",
      endDate: new Date(),
      status: this.title.replace(' ', '').toUpperCase(),
      holder: [],
      edit: true,
      kanbanId: this.kanban
    });
  }

  removeTask(id: string) {
    this.tasks = this.tasks.filter(e => e.idTask != id);
  }

  drop(event: CdkDragDrop<object[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      // console.log((event.container.data[event.currentIndex] as any).idTask,this.title);
      (event.container.data[event.currentIndex] as any).status = this.title.replace(' ', '').toUpperCase();
      if (!(event.container.data[event.currentIndex] as any).edit) {
        const idTask = (event.container.data[event.currentIndex] as any).idTask;
        this.tasksService.setStatus(idTask, this.title.replace(' ', '').toUpperCase()).subscribe((result: any) => {
          console.log("status changed", result);
        });
      }

    }
    // console.log('drop', event, this.title, this.tasks);

  }

  // connectedList() {
  //   switch(this.title) {
  //     case 'TODO': return "['doneList', 'inprogressList']";
  //     case 'Done': return "['todoList', 'inprogressList']";
  //     case 'In Progress': return "['doneList', 'todoList']";
  //     default: return ''
  //   }
  // }
}
