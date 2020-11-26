import { AuthService } from './../../services/auth.service';
import { UtilsService } from './../../services/utils.service';
import { Injectable } from '@angular/core';
import { AppDataService } from 'app/services/app-data.service';
import { Http } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ClassDataService {

  private activeClass: any;
  private activeClassData: any;
  private classProductAnalytics = {};
  private numberOfStudents: number;
  private classAverageCompletion: number;
  private studentsEnrolledStats: any;
  private classObjectivesAnalytics : {};
  private totalClassTimespentAllStudents: number
  private classTotalTimeSpent:any;
  constructor(
    private utilsService: UtilsService,
    private appDataService: AppDataService,
    private http: Http,
    private authService: AuthService,
  ) {
    this.authService.loggedOut.subscribe(() => this.clearData());
  }

  public get NumberOfStudents() {
    return this.numberOfStudents;
  }
  public set NumberOfStudents(NumberOfStudents) {
    this.numberOfStudents = NumberOfStudents;
  }
  public get getClassTotalTimeSpent() {
    return this.classTotalTimeSpent;
  }
  public set setClassTotalTimeSpent(ClassTotalTimeSpent) {
    this.classTotalTimeSpent = ClassTotalTimeSpent;
  }
  public set ActiveClass(activeClass) {
    this.activeClass = activeClass;
  }

  public get ActiveClass() {
    return this.activeClass;
  }


  public set ActiveClassData(activeClassData) {
    this.activeClassData = activeClassData;
  }

  public get ActiveClassData() {
    return this.activeClassData;
  }
  public set ClassProductAnalytics(classProductAnalytics) {
    this.classProductAnalytics = classProductAnalytics;
  }

  public get ClassProductAnalytics() {
    return this.classProductAnalytics;
  }
  public set ClassAverageCompletion(classAverageCompletion) {
    this.classAverageCompletion = classAverageCompletion;
  }

  public get ClassAverageCompletion() {
    return this.classAverageCompletion;
  }
  public set StudentsEnrolledStats(studentsEnrolledStats) {
    this.studentsEnrolledStats = studentsEnrolledStats;
  }

  public get StudentsEnrolledStats() {
    return this.studentsEnrolledStats;
  }

  public set ClassObjectivesAnalytics(classObjectivesAnalytics) {
    this.classObjectivesAnalytics = classObjectivesAnalytics;
  }

  public get ClassObjectivesAnalytics() {
    return this.classObjectivesAnalytics;
  }
  public set TotalClassTimespentAllStudents(totalClassTimespentAllStudents) {
    this.totalClassTimespentAllStudents = totalClassTimespentAllStudents;
  }

  public get TotalClassTimespentAllStudents() {
    return this.totalClassTimespentAllStudents;
  }
  

  public clearData() {
    this.ActiveClass = null;
    this.activeClassData = null;
  }
}



