import { ProductResolveService } from './../servo-system-course/services/product-resolve.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClassAnalyticsResolveService } from './services/class-analytics-resolve.service';
import { ClassDashboardComponent } from './class-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ClassDashboardComponent,
    resolve: {
      productResolve:ProductResolveService,
      classAnlytics: ClassAnalyticsResolveService
    }
  },
  { path: '**', redirectTo: '', }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassDashboardRoutingModule { }
