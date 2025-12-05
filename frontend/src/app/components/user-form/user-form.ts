import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserFormComponent implements OnChanges {
  @Input() userToEdit: User | null = null;
  @Output() userAdded = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();

  user: User = {
    name: '',
    email: ''
  };

  error: string | null = null;
  success: string | null = null;
  submitting = false;
  isEditMode = false;

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userToEdit'] && this.userToEdit) {
      this.user = { ...this.userToEdit };
      this.isEditMode = true;
    }
  }

  onSubmit(): void {
    if (!this.user.name || !this.user.email) {
      this.error = 'Tous les champs sont requis';
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    if (this.isEditMode && this.user.id) {
      this.userService.updateUser(this.user.id, this.user).subscribe({
        next: () => {
          this.success = 'Utilisateur modifié avec succès';
          this.resetForm();
          this.userUpdated.emit();
          setTimeout(() => this.success = null, 3000);
        },
        error: (err) => {
          this.error = 'Erreur lors de la modification';
          this.submitting = false;
          console.error(err);
        }
      });
    } else {
      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.success = 'Utilisateur créé avec succès';
          this.resetForm();
          this.userAdded.emit();
          setTimeout(() => this.success = null, 3000);
        },
        error: (err) => {
          this.error = 'Erreur lors de la création';
          this.submitting = false;
          console.error(err);
        }
      });
    }
  }

  resetForm(): void {
    this.user = { name: '', email: '' };
    this.isEditMode = false;
    this.submitting = false;
  }

  cancelEdit(): void {
    this.resetForm();
    this.userUpdated.emit();
  }
}
