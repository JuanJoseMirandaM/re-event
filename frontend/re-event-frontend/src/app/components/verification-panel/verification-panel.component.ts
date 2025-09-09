import {ChangeDetectionStrategy, Component, computed, inject, input, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {SlidePanelComponent} from "../slide-panel/slide-panel.component";
import {UserService} from "../../core/services/user.service";
import {ConfettiModalComponent, ConfettiModalConfig} from "../confetti-modal/confetti-modal.component";
import {ToastService} from "../../core/services/toast.service";

@Component({
  selector: 'app-verification-panel',
  imports: [FormsModule, SlidePanelComponent, ConfettiModalComponent, TranslatePipe],
  templateUrl: './verification-panel.component.html',
  styleUrl: './verification-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationPanelComponent {
  isVisible = input.required<boolean>();

  closePanel = output<void>();

  #userService = inject(UserService);
  #toast = inject(ToastService);

  verificationCode = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showConfettiModal = signal<boolean>(false);

  confettiConfig = signal<ConfettiModalConfig>({
    title: '¡Usuario Acreditado!',
    description: 'Tu código de verificación ha sido validado exitosamente. ¡Bienvenido al AWS Community Day Bolivia 2025!',
    buttonText: '¡Perfecto!',
    icon: 'verified_user'
  });

  isFormValid = computed(() => {
    return this.verificationCode().trim().length >= 6;
  });

  onVerificationCodeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.verificationCode.set(target.value.toUpperCase());
    this.clearMessages();
  }

  async onSubmit() {
    if (this.isFormValid()) {
      this.isLoading.set(true);
      this.clearMessages();

      this.#userService.verifyCode(this.verificationCode().trim()).subscribe({
        next: (result) => {
          if (result?.success) {
            this.onClose();
            this.showConfettiModal.set(true);
          } else {
            console.error(result?.message || 'Error en la verificación');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error en la verificación:', err.error.error);
          this.#toast.error(err.error.error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onClose() {
    this.clearForm();
    this.closePanel.emit();
  }

  onConfettiModalClose() {
    this.showConfettiModal.set(false);
  }

  private clearMessages() {
    this.errorMessage.set('');
  }

  private clearForm() {
    this.verificationCode.set('');
    this.clearMessages();
    this.isLoading.set(false);
  }
}
