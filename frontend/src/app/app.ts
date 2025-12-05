import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list';
import { UserFormComponent } from './components/user-form/user-form';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserListComponent, UserFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(UserListComponent) userList!: UserListComponent;
  title = 'Mini API TS - Frontend';
  selectedUser: User | null = null;

  onUserAdded(): void {
    this.selectedUser = null;
    if (this.userList) {
      this.userList.loadUsers();
      this.userList.selectedUser = null;
    }
  }

  onUserUpdated(): void {
    this.selectedUser = null;
    if (this.userList) {
      this.userList.loadUsers();
      this.userList.selectedUser = null;
    }
  }

  onUserSelected(user: User): void {
    this.selectedUser = user;
  }
}
