import { UtilsService } from './../../services/utils.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-progress-viewer',
  templateUrl: './progress-viewer.component.html',
  styleUrls: ['./progress-viewer.component.scss']
})
export class ProgressViewerComponent implements OnInit, OnDestroy {
  @Input() progressList;
  @Input() chapterList;
  learningObjectiveChapterMap: any[];

  objectKeys = Object.keys;

  constructor(private utilsService: UtilsService) {
  }

  ngOnInit() {
    this.extractObjectiveChapterMap();
    this.bindEvents();
  }

  ngOnDestroy() {
    this.learningObjectiveChapterMap = [];
  }

  splitTimeString(timeString: string) {
    if (timeString !== 'less than 1 min') {
      return timeString.match(new RegExp('\\d+|\\w+', 'g'));
    } else {
      return ['less than 1 min'];
    }
  }

  bindEvents() {
    // jQuery('#learningObjectiveAccordion').on('show.bs.collapse', function(e) {
    //   jQuery(e.target).parents('.card').addClass('bt br bl bb');
    // })
    // jQuery('#learningObjectiveAccordion').on('hidden.bs.collapse', function(e) {
    //   jQuery(e.target).parents('.card').removeClass('bt br bl bb');
    // })
    jQuery('#learningObjectiveAccordion').on('show.bs.collapse', function (e) {
      // jQuery(e.target).parents('.card').addClass('bt br bl bb');
      // console.log(e.target);
      jQuery(e.target).siblings('.card-header').css({ 'background-color': '#efefef' });
    })
    jQuery('#learningObjectiveAccordion').on('hidden.bs.collapse', function (e) {
      // jQuery(e.target).parents('.card').removeClass('bt br bl bb');
      jQuery(e.target).siblings('.card-header').css({ 'background-color': '#ffffff' });
    })
  }

  extractObjectiveChapterMap() {
    this.learningObjectiveChapterMap = JSON.parse(JSON.stringify(this.chapterList.learningObjectivesProgress['learning-objectives']));
    for (let chapterIndex = 0; chapterIndex < this.chapterList.data.length; chapterIndex++) {
      for (let sectionIndex = 0; sectionIndex < this.chapterList.data[chapterIndex].items.length; sectionIndex++) {
        // Check if section is reading
        if (this.chapterList.data[chapterIndex].items[sectionIndex]['sub-type'] === 'md') {
          let sectionLOsIDAry: any[] = this.chapterList.data[chapterIndex].items[sectionIndex]['learning-objectives'];
          sectionLOsIDAry = sectionLOsIDAry.map((sectionLOID) => {
            if (sectionLOID.includes('/')) {
              return sectionLOID.split('/')[1];
            }
            return sectionLOID;
          });
          // Getting section mapped LOs (all LOs whose id present in 'sectionLOsIDAry' array)
          let sectionMappedLOs: any[] = this.utilsService.getMappedLOs(sectionLOsIDAry, this.chapterList.learningObjectivesProgress);
          if (sectionMappedLOs && sectionMappedLOs.length > 0) {
            for (let mappedLOObj of sectionMappedLOs) {
              // Getting the LO object from 'this.learningObjectiveChapterMap' having id same as of mapped LO object.
              let resourceLOObj: any = this.learningObjectiveChapterMap.find((loObj) => {
                return mappedLOObj['id'] === loObj['id'];
              });
              if (resourceLOObj && resourceLOObj['mappedSections'] === undefined) {
                resourceLOObj.mappedSections = [];
              }
              // Checking if 'mappedSections' array already contains an object with same section name or not
              if (!(resourceLOObj.mappedSections.find((c) => c.sectionName == this.chapterList.data[chapterIndex].items[sectionIndex].name))) {
                resourceLOObj.mappedSections.push({
                  'chapterName': this.chapterList.data[chapterIndex].title,
                  'sectionName': this.chapterList.data[chapterIndex].items[sectionIndex].name,
                  'status': this.chapterList.data[chapterIndex].items[sectionIndex].__analytics.status,
                  'timespent': this.chapterList.data[chapterIndex].items[sectionIndex].__analytics.timespent
                });
              }
            }
          }
        }
        // Uncomment to display test your understanding sections
        // if (this.chapterList.data[chapterIndex].items[sectionIndex].embedded) {
        //   for (const embeddedTest of this.chapterList.data[chapterIndex].items[sectionIndex].embedded) {
        //     for (const lo of embeddedTest['learning-objectives']) {
        //       if (!this.learningObjectiveChapterMap[lo].mappedSections) {
        //         this.learningObjectiveChapterMap[lo].mappedSections = [];
        //       }
        //       this.learningObjectiveChapterMap[lo].mappedSections.push({
        //         'chapterName': this.chapterList.data[chapterIndex].title,
        //         'sectionName': this.chapterList.data[chapterIndex].items[sectionIndex].name,
        //         'isEmbedded': true,
        //         'status': embeddedTest.questions[0].__analytics.statusEvaluation ?
        //                  (embeddedTest.questions[0].__analytics.statusEvaluation === 'correct' ? 'completed' : 'in_complete' ) :
        //                  'not_started',
        //         'timespent': embeddedTest.__analytics.timespent
        //       });
        //     }
        //   }
        // }
      }
    }

    // Uncomment to modify LO progress by taking into account the correct/incorrect status of embedded questions
    for (const loObj of this.learningObjectiveChapterMap) {
      let completedSections = 0;
      if (loObj.mappedSections && loObj.mappedSections.length) {
        for (const mappedSection of loObj.mappedSections) {
          if (mappedSection.status === 'completed') {
            completedSections++;
          }
        }
        loObj.progress = Math.ceil((completedSections / loObj.mappedSections.length) * 100);
      } else {
        loObj.progress = 0;
      }
    }
  }
}
