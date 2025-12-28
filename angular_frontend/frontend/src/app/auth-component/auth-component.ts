import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth-component.html',
  styleUrls: ['./auth-component.css']
})
export class AuthComponent implements OnInit {

  authForm!: FormGroup;
  isLoginMode = true;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      // Signup-only fields
      first_name: [''],
      last_name: [''],
      password_confirm: ['']
    });
  }

  onSwitchMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;

    if (!this.isLoginMode) {
      this.enableSignupValidators();
    } else {
      this.disableSignupValidators();
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const {
      email,
      password,
      first_name,
      last_name,
      password_confirm
    } = this.authForm.value;

    if (this.isLoginMode) {
      this.authService.login(email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err?.error?.detail || 'Login failed';
        }
      });
    } else {
      this.authService.signup(
        email,
        password,
        first_name,
        last_name,
        password_confirm
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.isLoginMode = true;
          this.disableSignupValidators();
          this.authForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err?.error?.detail || 'Signup failed';
        }
      });
    }
  }

  /* -------------------------
     Validator Management
  -------------------------- */

  private enableSignupValidators(): void {
    this.authForm.get('first_name')?.setValidators([Validators.required]);
    this.authForm.get('last_name')?.setValidators([Validators.required]);
    this.authForm.get('password_confirm')?.setValidators([
      Validators.required
    ]);

    this.updateSignupControls();
  }

  private disableSignupValidators(): void {
    this.authForm.get('first_name')?.clearValidators();
    this.authForm.get('last_name')?.clearValidators();
    this.authForm.get('password_confirm')?.clearValidators();

    this.updateSignupControls();
  }

  private updateSignupControls(): void {
    this.authForm.get('first_name')?.updateValueAndValidity();
    this.authForm.get('last_name')?.updateValueAndValidity();
    this.authForm.get('password_confirm')?.updateValueAndValidity();
  }

}
