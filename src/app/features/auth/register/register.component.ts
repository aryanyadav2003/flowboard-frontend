import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading  = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/workspaces']);
    }

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role:     ['Member', [Validators.required]]
    });
  }

  get fullName() { return this.registerForm.get('fullName'); }
  get email()    { return this.registerForm.get('email'); }
  get username() { return this.registerForm.get('username'); }
  get password() { return this.registerForm.get('password'); }
  get role()     { return this.registerForm.get('role'); }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading  = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/workspaces']);
        } else {
          this.errorMsg = res.message;
          this.loading  = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Registration failed. Try again.';
        this.loading  = false;
        this.cdr.detectChanges();
      }
    });
  }
}