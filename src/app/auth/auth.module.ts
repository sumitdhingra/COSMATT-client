import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module.';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AppCommonModule } from '../app-common/app-common.module';
import { ForgotPasswordComponent } from 'app/auth/forgot-password/forgot-password.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,
    AlertModule,
    AppCommonModule
  ],
  declarations: [
    LoginComponent,
    ForgotPasswordComponent
  ],
  providers: [AlertModule]
})
export class AuthModule { }
