import { Component, OnInit } from '@angular/core';
import { AppDataService } from 'app/services/app-data.service';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';

@Component({
  selector: 'app-students-enrolled',
  templateUrl: './students-enrolled.component.html',
  styleUrls: ['./students-enrolled.component.scss']
})
export class StudentsEnrolledComponent implements OnInit {

  constructor(public appDataService :AppDataService,
    public classDataService :ClassDataService) { }

  ngOnInit() {
  }

}
