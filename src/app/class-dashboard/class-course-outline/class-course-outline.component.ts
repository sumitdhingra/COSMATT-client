import { Component, OnInit, Input } from '@angular/core';
import { AppDataService } from 'app/services/app-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-class-course-outline',
  templateUrl: './class-course-outline.component.html',
  styleUrls: ['./class-course-outline.component.scss']
})
export class ClassCourseOutlineComponent implements OnInit {

  @Input() progressList;
  @Input() totalStudents;
  checked = true;
  chapterStatus: any;
  constructor() { }

  ngOnInit() {
    this.addChapterSectionStatus();
    this.bindEvents();
    this.enableJqueryUtilityFunctions();
    this.enableDragDrop();
  }

  bindEvents() {
    jQuery('#chapterProgressAccordion').on('show.bs.collapse', function (e) {
      // jQuery(e.target).parents('.card').addClass('bt br bl bb');
      // console.log(e.target);
      jQuery(e.target).siblings('.card-header').css({ 'background-color': '#efefef' });
    })
    jQuery('#chapterProgressAccordion').on('hidden.bs.collapse', function (e) {
      // jQuery(e.target).parents('.card').removeClass('bt br bl bb');
      jQuery(e.target).siblings('.card-header').css({ 'background-color': '#ffffff' });
    })
  }

  enableJqueryUtilityFunctions() {
    (function () {
      var stylesToSnapshot = ["transform", "-webkit-transform"];

      $.fn.snapshotStyles = function () {
        if (window.getComputedStyle) {
          $(this).each(function () {
            for (var i = 0; i < stylesToSnapshot.length; i++)
              this.style[stylesToSnapshot[i]] = getComputedStyle(this)[stylesToSnapshot[i]];
          });
        }
        return this;
      };

      $.fn.releaseSnapshot = function () {
        $(this).each(function () {
          this.offsetHeight; // Force position to be recomputed before transition starts
          for (var i = 0; i < stylesToSnapshot.length; i++)
            this.style[stylesToSnapshot[i]] = "";
        });
      };
    })();
  }

  enableDragDrop() {

    $(function () {
      $(".chapterSortable").sortable({
        handle: '.fa.fa-bars',
        revert: true,
        start: function (event, ui) {
          // Temporarily move the dragged item to the end of the list so that it doesn't offset the items
          // below it (jQuery UI adds a 'placeholder' element which creates the desired offset during dragging)
          $(ui.item).appendTo(this).addClass("dragging");
        },
        stop: function (event, ui) {
          // jQuery UI instantly moves the element to its final position, but we want it to transition there.
          // So, first convert the final top/left position into a translate3d style override
          var newTranslation = "translate3d(" + ui.position.left + "px, " + ui.position.top + "px, 0)";
          $(ui.item).css("-webkit-transform", newTranslation)
            .css("transform", newTranslation);
          // ... then remove that override within a snapshot so that it transitions.
          $(ui.item).snapshotStyles().removeClass("dragging").releaseSnapshot();
        }
      }).bind('sortupdate', function () {
        $(".chapterSortable").children().each(function (index) {
          $(this).find('.index').html(String(index + 1));
        });
      });
      $(".chapterSortable").disableSelection();
    });

    $(function () {
      $('[id^="sectionSortable"]').sortable({
        handle: '.fa.fa-bars',
        revert: true,
        start: function (event, ui) {
          // Temporarily move the dragged item to the end of the list so that it doesn't offset the items
          // below it (jQuery UI adds a 'placeholder' element which creates the desired offset during dragging)
          $(ui.item).appendTo(this).addClass("dragging");
        },
        stop: function (event, ui) {
          // jQuery UI instantly moves the element to its final position, but we want it to transition there.
          // So, first convert the final top/left position into a translate3d style override
          var newTranslation = "translate3d(" + ui.position.left + "px, " + ui.position.top + "px, 0)";
          $(ui.item).css("-webkit-transform", newTranslation)
            .css("transform", newTranslation);
          // ... then remove that override within a snapshot so that it transitions.
          $(ui.item).snapshotStyles().removeClass("dragging").releaseSnapshot();
        }
      });
      $('[id^="sectionSortable"]').disableSelection();
    });
  }

  addChapterSectionStatus() {
    for (let chapter = 0; chapter < this.progressList.data.length; chapter++) {
      this.progressList.data[chapter].status = true;
      for (let section = 0; section < this.progressList.data[chapter].items.length; section++) {
        this.progressList.data[chapter].items[section].status = true;
      }
    }
  }

  chapterToggle(chapterNumber) {
    if (this.progressList.data[chapterNumber].status) {
      this.progressList.data[chapterNumber].status = false;
    } else {
      this.progressList.data[chapterNumber].status = true;
    }
    for (let section = 0; section < this.progressList.data[chapterNumber].items.length; section++) {
      if (this.progressList.data[chapterNumber].status) {
        this.progressList.data[chapterNumber].items[section].status = true;
      } else {
        this.progressList.data[chapterNumber].items[section].status = false;
      }
    }
  }

  sectionToggle(chapterNumber, sectionNumber) {
    if (!this.progressList.data[chapterNumber].items[sectionNumber].status) {
      this.progressList.data[chapterNumber].items[sectionNumber].status = true;
    } else {
      this.progressList.data[chapterNumber].items[sectionNumber].status = false;
    }
  }
}
