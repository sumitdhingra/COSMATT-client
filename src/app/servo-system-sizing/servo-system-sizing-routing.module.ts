import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServoSystemSizingComponent } from './servo-system-sizing.component';
import { SizingAppComponent } from './sizing-app/sizing-app.component';

const routes: Routes = [{
  path: '',
  component: ServoSystemSizingComponent,
  children: [
    {
      path: ':id',
      component: SizingAppComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServoSystemSizingRoutingModule { }
