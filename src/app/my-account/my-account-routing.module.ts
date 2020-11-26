import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyAccountComponent } from './my-account.component';
import { MyAccountResolverService } from './services/my-account-resolver.service';
import { ResetuseraccountComponent } from './resetuseraccount/resetuseraccount.component';

const myAccountRoutes: Routes = [
  {
    path: '',
    component: MyAccountComponent,
    resolve: {
      userInfo: MyAccountResolverService
    },
  },
  {
    path: 'reset-user',
    component: ResetuseraccountComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(myAccountRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MyAcountRoutingModule { }
