import { Component, OnInit, SimpleChange, AfterViewInit, ElementRef, Input } from '@angular/core';
import { UtilsService } from 'app/services/utils.service';


@Component({
  selector: 'app-course-toc',
  templateUrl: './course-toc.component.html',
  styleUrls: ['./course-toc.component.scss']
})
export class CourseTocComponent implements OnInit {
  @Input() tocArray: any;
  @Input() courseObjective: any;
  mappedLOs: any[] = [];

  constructor(
    private utilsService: UtilsService
  ) { }

  ngOnInit() { }

  private getLoList(module) {
    let chapterObj = [];
    module['items'].forEach(element => {
      let linkedLO = element['learning-objectives'];//extracting Linked LOs
      linkedLO.forEach(element => {
        if (element.includes('/'))
          element = element.split('/')[1]
        chapterObj.push(element);
      });
    });
    //Returns LOs related to each chapter
    this.mappedLOs = this.utilsService.getMappedLOs(chapterObj, this.courseObjective);
    return this.mappedLOs;

  }
}
