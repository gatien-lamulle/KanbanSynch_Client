import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import UUID from 'uuid-int';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const generator = UUID(50);

@Injectable({
  providedIn: 'root'
})
export class KanbanService {

  constructor(private apollo: Apollo) { }

  kanbanId: string | null = null;

  createNewKanban(name: String = "My Kanban", creator: String | null = null ) {
    let id = generator.uuid();
    console.log('Creation new Kanban....');
    console.log(id);

    return new Promise((resolve, reject) => {
      this.apollo.mutate({
        mutation: gql`mutation AddKanban($creatorId: ID) {
          addKanban(id: ${id}, isPublic: false, creatorId: $creatorId, name: "${name}") {
            idKanban
            public
          }
        }`,
        variables: {
          creatorId: creator ? creator : null
        }
      }).subscribe((result: any) => {
        console.log("Kanban create", result);
        localStorage.setItem('myKanban', result.data.addKanban.idKanban);
        this.kanbanId = result.data.addKanban.idKanban;
        resolve(result.data.addKanban.idKanban);
      })
    });

  }

  hasKanban(id: any = null) {
    this.kanbanId = localStorage.getItem('myKanban');
    if (!this.kanbanId && !id) return of(false);
    return this.apollo.watchQuery({
      query: gql`{
        checkKanban(id: ${id || this.kanbanId})
      }`
    }).valueChanges.pipe(
      switchMap((msg: any) => {
        return of(msg.data.checkKanban);
      })
    );
  }

  getKanban(id: any = null) {
    this.kanbanId = this.kanbanId || localStorage.getItem('myKanban');
    if (!this.kanbanId && !id) throw new Error('No Kanban associate');
    return this.apollo.watchQuery({
      query: gql`{
        kanban(id: ${id || this.kanbanId}) {
          idKanban
          public
          name
          creator {
            username,
          }
          guests {
            username,
          }
        }
      }`
    }).valueChanges;
  }

  publicKanbanToggle(isPublic: Boolean) {
    if (!this.kanbanId) throw new Error('No Kanban associate');
    return this.apollo.mutate({
      mutation: gql`mutation{
        setPublic(kanbanId: ${this.kanbanId}, isPublic: ${isPublic}) {
          idKanban
          public
        }
      }`
    })
  }

  addGuest(username: String) {
    if (!this.kanbanId) throw new Error('No Kanban associate');
    return this.apollo.mutate({
      mutation: gql`mutation{
        addGuest(kanbanId: ${this.kanbanId}, userId: "${username}") {
          username
          email
        }
      }`
    })
  }

  removeGuest(username: String, id: String | null = null) {
    const kanban = id || this.kanbanId;
    if (!kanban) throw new Error('No Kanban associate');
    return this.apollo.mutate({
      mutation: gql`mutation{
        removeGuest(kanbanId: ${kanban}, userId: "${username}") {
          username
        }
      }`
    })
  }

  setOwner() {
    if (!this.kanbanId) throw new Error('No Kanban associate');
    return this.apollo.mutate({
      mutation: gql`mutation{
        setCreator(kanbanId: ${this.kanbanId}) {
          idKanban
        }
      }`
    }).subscribe();
  }

  setName(name: String) {
    console.log(name);

    if (!this.kanbanId) throw new Error('No Kanban associate');
    return this.apollo.mutate({
      mutation: gql`mutation{
        setName(kanbanId: ${this.kanbanId}, name: "${name}") {
          idKanban
        }
      }`
    }).subscribe();
  }

  removeKanban(id: any = null) {
    if (!this.kanbanId && !id) throw new Error('No Kanban associate');
    const current_id = id || this.kanbanId;
    return this.apollo.mutate({
      mutation: gql`mutation{
        removeKanban(id: ${current_id}) {
          idKanban
        }
      }`
    });
  }

  getGuestedKanbans(username: String) {
    return this.apollo.watchQuery({
      query: gql`{
        kanbans(guest:  {username: "${username}"}) {
          idKanban
          name
          creator {
            username,
          }
        }
      }`
    }).valueChanges;
  }

  getOwnerKanbans(username: String) {
    return this.apollo.watchQuery({
      query: gql`{
        kanbans(creator:  {username: "${username}"}) {
          idKanban
          name
          creator {
            username,
          }
        }
      }`
    }).valueChanges;
  }


}
