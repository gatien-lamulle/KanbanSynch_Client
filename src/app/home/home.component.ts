import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { KanbanService } from '../services/kanban.service';
import { UsersService } from '../services/users.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  constructor(private kanbanService: KanbanService, private userService: UsersService, private route: ActivatedRoute,) {}

  ngOnInit(): void {
    console.log('home init');

    if (this.preview) {
      this.homeStyle = {
        scale: this.preview.scaleValue,
        transformOrigin: "top left",
        width: 'fit-content',
      }
    }

    this.route.queryParams.subscribe(params => {
      console.log(params['id'], params, 'params');

      if (params['id'] || this.preview?.kanbanId) {
        console.log(params['id']);
        this.guestId = params['id'] || this.preview!.kanbanId;
        this.kanbanService.hasKanban(this.guestId).subscribe();
        if (params['id']) {
          localStorage.setItem('myKanban', params['id']);
        }
        this.kanbanService.getKanban(this.guestId).subscribe((result: any) => {
          this.title = result.data.kanban.name;
          console.log(this.title);

        });

      } else {
        this.userService.checkToken();
        this.kanbanService.hasKanban().subscribe((res: any) => {
          if (!res) {
            console.log(this.userService.user);
            if (this.userService.user && this.userService.user.exist && this.userService.user.username) {
              this.kanbanService.createNewKanban(this.title, this.userService.user.username);
            } else {
              this.kanbanService.createNewKanban(this.title);
            }
          } else {
            console.log(res);
            this.kanbanService.getKanban().subscribe((result: any) => {
              this.title = result.data.kanban.name;
            });
          }
        });
      }
    });


    // if (this.kanbanService.hasKanban()) {

    //   // this.kanbanService.getKanban().subscribe((result: any) => {
    //   //   console.log('kanban:', result);
    //   //   this.tasks = result.data.kanban.tasks;
    //   //   this.guests = result.data.kanban.guests;
    //   // });
    // } else {
    //   this.kanbanService.createNewKanban();
    // }
  }

  @Input()
  preview: {scaleValue: Number, kanbanId: any} | null = null;

  title: string = 'My Kanban';
  homeStyle = {};
  guestId: any;
  changeTitle: Boolean = false;
  @ViewChild('titleKanban') titleElement: ElementRef<HTMLInputElement> | undefined;
  // tasks: any = [];
  // guests: any = [];

  async titleChange() {
    let input = this.titleElement?.nativeElement?.textContent?.trim();
    console.log(input);
    if (input !== this.title) {
      this.changeTitle = true;
    } else {
      this.changeTitle = false;
    }

  }

  kanban() : string {
    return this.guestId || this.kanbanService.kanbanId || '';
  }

  saveTitle() {
    let currentTitle = this.titleElement!.nativeElement!.textContent!.trim();
    this.kanbanService.setName(currentTitle);
    this.changeTitle = false;
    this.title = currentTitle;
  }

  // todoTask() {
  //   return this.tasks.filter((e: { status: string; }) => e.status === 'TODO');
  // }

  // inprogressTask() {
  //   return this.tasks.filter((e: { status: string; }) => e.status === 'inprogress');
  // }

  // doneTask() {
  //   return this.tasks.filter((e: { status: string; }) => e.status === 'Done');
  // }

}

