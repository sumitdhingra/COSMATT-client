import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AlertModule } from 'ngx-bootstrap/alert';

import { MyAccountComponent } from './my-account.component';
import { GravatarComponent } from '../app-common/gravatar/gravatar.component';
import { UserInfoComponent } from '../app-common/user-info/user-info.component';
import { UserSettingsComponent } from '../app-common/user-settings/user-settings.component';
import { SubscriptionDetailsComponent } from '../app-common/subscription-details/subscription-details.component';
import { MyAcountRoutingModule } from './my-account-routing.module';

import { GravatarService } from './services/gravatar.service';
import { AppDataService } from '../services/app-data.service';
import { MyAccountResolverService } from './services/my-account-resolver.service';
import { FetchUserDetailsService } from './services/fetch-user-details.service';
import { UpdateUserDetailsService } from './services/update-user-details.service';
import { UpdateInteractionService } from './services/update-interaction.service';
import { ResetuseraccountComponent } from './resetuseraccount/resetuseraccount.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MyAcountRoutingModule,
    AlertModule
  ],
  declarations: [
    MyAccountComponent,
    GravatarComponent,
    UserInfoComponent,
    UserSettingsComponent,
    SubscriptionDetailsComponent,
    ResetuseraccountComponent
  ],
  providers: [
    GravatarService,
    AppDataService,
    MyAccountResolverService,
    FetchUserDetailsService,
    UpdateUserDetailsService,
    UpdateInteractionService,
    AlertModule
  ]
})
export class MyAccountModule { }
