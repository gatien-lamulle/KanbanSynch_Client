import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import UUID from 'uuid-int';
import {format} from 'date-fns'
import { BehaviorSubject } from "rxjs";

const generator = UUID(50);

interface Tasks {
  [index: string]: Array<any>,
}

const init : Tasks = {"TODO": [], "INPROGRESS": [], "DONE": []};


@Injectable({
  providedIn: "root",
})
export class TasksService {
  constructor(private apollo: Apollo) {}
  tasks: BehaviorSubject<Tasks> = new BehaviorSubject(init)

  getAllTasks(kanbanId: string) {
    ["TODO", "INPROGRESS", "DONE"].forEach(e => {
      this.getTasksByStatus(kanbanId, e);
    });
  }

  getTasksByStatus(kanbanId: string, status: string) {
    console.log('getTask');

    return new Promise ((resolve, reject) => {
      this.apollo.watchQuery({
        query: gql`{
          tasks(kanban: ${kanbanId}, status: "${status}") {
            idTask
            status
            title
            description
            endDate
            holder {
              username
            }
          }
        }`, fetchPolicy: 'cache-and-network'
      }).valueChanges.subscribe((result: any) => {
        let temp = this.tasks.getValue();
        temp[status] = result.data.tasks.map((e: any) => {
          return {...e, edit: false};
        });
        this.tasks.next(temp);
        resolve(this.tasks.getValue()[status]);
      });
    });
  }

  setStatus(taskId: string, status: string) {
    return this.apollo.mutate({
      mutation: gql`mutation{
        setStatus(taskId: ${taskId}, status: ${status}) {
          idTask
          status
        }
      }`,
    });
  }

  addHolder(taskId: String, username: String) {
    return this.apollo.mutate({
      mutation: gql`mutation{
        addHolder(taskId: "${taskId}", userId: "${username}") {
          username
        }
      }`,
    });
  }

  removeHolder(taskId: String, username: String) {
    return this.apollo.mutate({
      mutation: gql`mutation{
        removeHolder(taskId: "${taskId}", userId: "${username}") {
          username
        }
      }`,
    });
  }

  updateTask(task: any) {
    if (!task.idTask) {
      task.idTask = generator.uuid();
    }
    if (!task.kanbanId) {
      task.kanbanId = localStorage.getItem('myKanban');
    }

    // let a = `addTask(id: "${task.idTask}", title: "${task.title}", description: "${task.description}",
    //   endDate: "${format(new Date(task.endDate), 'dd/MM/yyyy HH:mm')}", holders: ${task.holder.length ? (JSON.stringify(task.holder) as string).replace(/"username"/g, 'username') : '[]' }, status: ${task.status}, kanbanId: ${task.kanbanId})`
    // console.log(task, a);
    const date = format(new Date(task.endDate), 'dd/MM/yyyy HH:mm');
    console.log('ici', date);
    return this.apollo.mutate({
      mutation: gql`mutation{
        addTask(id: ${task.idTask}, title: "${task.title}", description: "${task.description}", endDate: "${date}", holders: ${task.holder.length ? JSON.stringify(task.holder).replace(/"username"/g, 'username') : "[]" }, status: ${task.status}, kanbanId: ${task.kanbanId}) {
          idTask
        }
      }`,
    });
  }

  removeTask(id: string) {
    return this.apollo.mutate({
      mutation: gql`mutation{
        removeTask(id: ${id}) {
          idTask
        }
      }`,
    });

  }
}
