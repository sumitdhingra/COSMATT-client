import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: 'app/auth/auth.module#AuthModule'
  },
  {
    path: '',
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        redirectTo: 'courses',
        pathMatch: 'full'
      },
      {
        path: 'my-account',
        loadChildren: 'app/my-account/my-account.module#MyAccountModule'
      },
      {
        path: 'courses',
        loadChildren: 'app/course-list/course-list.module#CourseListModule'
      },
      {
        path: 'courses/training/:id',
        loadChildren: 'app/servo-system-course/servo-system-course.module#ServoSystemCourseModule'
      }
      ,
      {
        path: 'courses/training/:class/:id',
        loadChildren: 'app/servo-system-course/servo-system-course.module#ServoSystemCourseModule'
      }
      ,
      {
        path: 'courses/training/:class/:id/classdashboard',
        loadChildren: 'app/class-dashboard/class-dashboard.module#ClassDashboardModule'
      },
      {
        path: 'sizing-app',
        loadChildren: 'app/servo-system-sizing/servo-system-sizing.module#ServoSystemSizingModule'
      }
    ]
  },
  // fallback default route
  { path: '**', redirectTo: '', }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { initialNavigation: false })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
