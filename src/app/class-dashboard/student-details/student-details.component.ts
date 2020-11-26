import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import { StudentProgressService } from '../services/student-progress.service';
import { DashboardComponent } from 'app/servo-system-course/dashboard/dashboard.component'

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss'],
})
export class StudentDetailsComponent implements OnInit {
  @ViewChild(DashboardComponent)
  private dashboardComponent: DashboardComponent;

  rows = new Array<any>();
  columns = [ 
    { prop: 'name', search: true}, 
  ];
  @Input() student;
  @Output() studentChange = new EventEmitter<string>();
  @Output() closeStudentDetail = new EventEmitter();
  courses: Array<any>;
  dashBoardData: Array<any>;
  loader: boolean = false;
  studentName: string;


  constructor(private classDataService: ClassDataService, private studentProgressService: StudentProgressService) { 
    this.rows = this.classDataService.StudentsEnrolledStats['students'];
  }

  closeStudentDetails () {
    this.closeStudentDetail.emit();
  }
  onSelect(event) {
    this.loader = !this.loader;
    this.student = event;
    this.studentName = this.student.name;
    this.studentChange.emit(event);
    this.studentProgressService.getStudentData(this.student.uuid).then((studentData)=> {
      let studentCourse = studentData.shift();
      this.courses = studentCourse.course
      this.dashBoardData = studentData;
      this.dashBoardData.push(studentCourse.courseStatus);
      this.dashBoardData.push(this.student.uuid);
      setTimeout(()=>{
        this.dashboardComponent.getStudentDashboardData();
      },0)
    
      this.loader = !this.loader;
    })
  }
  ngOnInit() {
    if (!this.student) this.student = this.rows[0];
    this.studentProgressService.getStudentData(this.student.uuid).then((studentData)=> {
      this.loader = !this.loader;
      let studentCourse = studentData.shift();
      this.courses = studentCourse.course
      this.dashBoardData = studentData;
      this.dashBoardData.push(studentCourse.courseStatus);
      this.dashBoardData.push(this.student.uuid);
    });
    this.studentName = this.student.name;
  }
}
