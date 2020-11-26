import { Component, OnInit, Input } from '@angular/core';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import { ClassAnalyticsService } from '../services/class-analytics.service';
import { ProductService } from 'app/servo-system-course/services/product.service';

@Component({
  selector: 'app-class-objective-progress-viewer',
  templateUrl: './class-objective-progress-viewer.component.html',
  styleUrls: ['./class-objective-progress-viewer.component.scss']
})
export class ClassObjectiveProgressViewerComponent implements OnInit {
  courseObjectives: any;
  objectKeys = Object.keys;
  showLoading: boolean;
  constructor(
    private classDataService: ClassDataService,
    private classAnalyticsService: ClassAnalyticsService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.showLoading = true;
    this.classAnalyticsService.getClassObjectivesAnalytics().then(
      () => this.dataRecieved()
    );
  }

  dataRecieved() {
    const allLearningObjectives = this.productService.getObjectives();
    this.courseObjectives = this.appendTextToLOs(this.classDataService.ClassObjectivesAnalytics, allLearningObjectives['learning-objectives']);
    this.showLoading = false;
  }

  public appendTextToLOs(responseLOs: any, loResourceAry: any[]) {
    // Using try-catch to check for correct JSON structure, otherwise "JSON.parse()" will throw error
    try {
      responseLOs = JSON.parse(JSON.stringify(responseLOs));
    } catch (error) {
      console.log(error);
      return;
    }
    return this.appendText(responseLOs, loResourceAry);
  }

  private appendText(responseLOs: any[], loResourceAry: any[]) {
    // Base case of recursive code
    if (!loResourceAry || loResourceAry.length === 0) {
      return;
    }
    for (let i = 0; i < loResourceAry.length; i++) {
      this.appendText(responseLOs, loResourceAry[i]['learning-objectives']);
      // Filter Response LO whose id matches with  Resource LO
      const result = responseLOs.filter(loObject => loObject['learning-objective'] === loResourceAry[i]['id']);
      // If found, add text
      if (result.length > 0) result[0]['text'] = loResourceAry[i].text;
    }
    return responseLOs;
  }
}
