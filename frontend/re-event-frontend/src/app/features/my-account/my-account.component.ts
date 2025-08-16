import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-my-account',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'px-4 py-2 flex flex--col gap-4'
  }
})
export default class MyAccountComponent implements OnInit {
  #authService = inject(AuthService);
  #userService = inject(UserService);
  #formBuilder = inject(FormBuilder);

  user = signal<User | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  errorMessage = signal('');

  profileForm = this.#formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
  });

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading.set(true);

    this.#userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.populateForm(user);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage.set('Error al cargar el perfil del usuario');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      company: user.company || '',
      phoneNumber: user.phoneNumber || ''
    });
  }

  toggleEditMode(): void {
    const currentMode = this.isEditing();
    this.isEditing.set(!currentMode);

    if (!currentMode) {
      const currentUser = this.user();
      if (currentUser) {
        this.populateForm(currentUser);
      }
    }
  }

  formatPhoneNumber(phone: string | undefined | null): string {
    if (!phone) return 'Not specified';

    if (phone.startsWith('+')) {
      return phone;
    }

    if (/^\d+$/.test(phone)) {
      return `+591${phone}`;
    }

    return phone;
  }

  private cleanPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('591')) {
        cleaned = `+${cleaned}`;
      } else {
        cleaned = `+591${cleaned}`;
      }
    }

    return cleaned;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    const formValue = this.profileForm.value;
    const updatedData: Partial<User> = {
      name: formValue.name || undefined,
      email: formValue.email || undefined,
      company: formValue.company || undefined,
      phoneNumber: formValue.phoneNumber ? this.cleanPhoneNumber(formValue.phoneNumber) : undefined
    };

    this.#userService.updateUser(currentUser.userId, updatedData).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.isEditing.set(false);
        this.errorMessage.set('');
        console.log('Profile updated successfully');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage.set('Error al actualizar el perfil');
      }
    });
  }

  cancelEdit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.populateForm(currentUser);
    }
    this.isEditing.set(false);
    this.errorMessage.set('');
  }

  logout(): void {
    this.#authService.signOut().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.errorMessage.set('Error al cerrar sesión');
      }
    });
  }

  get currentUser(): User | null {
    return this.user();
  }

  get formControls() {
    return this.profileForm.controls;
  }
}
