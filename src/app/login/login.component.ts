import { LoginService } from './service/login.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm: FormGroup;
  errorMessage!: string;
  customSecurity = environment.customSecurity;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9]+$/),
          Validators.minLength(4),
          Validators.maxLength(20),
        ])
      ),
      password: this.formBuilder.control(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9\d@$!%*#?&]*[A-Z]+[a-zA-Z0-9\d@$!%*#?&]*$/
          ),
          Validators.pattern(
            /^[a-zA-Z0-9\d@$!%*#?&]*[0-9]+[a-zA-Z0-9\d@$!%*#?&]*$/
          ),
          Validators.pattern(
            /^[a-zA-Z0-9\d@$!%*#?&]*[a-z]+[a-zA-Z0-9\d@$!%*#?&]*$/
          ),
          Validators.minLength(6),
        ])
      ),
    });
  }

  ngOnInit(): void {}

  executeCustomLogin() {
    if (this.customSecurity.loginType === 'url') {
      window.location.href =
        this.customSecurity.baseUrl + this.customSecurity.loginEndpoint;
    }
  }

  login(loginBody: { username: string; password: string }) {
    this.loginService.login(loginBody).subscribe({
      error: (err) => {
        if (err.error) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Unknown Error';
        }
      },
      next: () => {
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
