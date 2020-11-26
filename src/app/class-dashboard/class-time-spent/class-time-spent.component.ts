
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import * as moment from 'moment';

import { CourseDataService } from '../../servo-system-course/services/course-data.service';
import { UtilsService } from './../../services/utils.service';
import { TocService } from '../../servo-system-course/services/toc.service';
import { AppDataService } from '../../services/app-data.service';
import { TIME_MODE_LIST } from './time-mode-list';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import { ClassAnalyticsService } from '../services/class-analytics.service';
// import "jquery-flot/jquery.flot.js";

declare const jQuery: any;

export enum YAxisValueType {
  Hours = 'HOURS',
  Minutes = 'MINUTES',
  Days = 'DAYS'
};

@Component({
  selector: 'app-class-time-spent',
  templateUrl: './class-time-spent.component.html',
  styleUrls: ['./class-time-spent.component.scss']
})
export class ClassTimeSpentComponent implements OnInit, AfterViewInit, OnDestroy {

  courseStartDate: number;
  elementRef: ElementRef;
  seriesData = {};
  chapterWiseData = [];
  mode = 'overall';
  loading = true;
  timeMode: string;
  loadingTimeMode = false;
  // To be used in HTML
  timeModeList = TIME_MODE_LIST;

  // Y-axis value type
  // private yAxisValueType: YAxisValueType = YAxisValueType.Minutes;

  // Options for flot graph
  private flotOptions = {
    grid: {
      borderWidth: { top: 0, bottom: 1, left: 1, right: 0 },
      borderColor: { bottom: '#343434', left: '#343434' },
      hoverable: true
    },
    series: {
      color: '#72B367'
    }
  };

  // Below this offset, tickSize will change according to flotOptions_smallResolution
  readonly SMALL_SCREEN_OFFSET = 550;
  // These are the time modes dependent on screen size to adjust tickSize
  readonly SCREEN_DEPENDENT_TIMEMODE = ['lastMonth', 'twoDays', 'oneDay'];
  // True if TimeSpent component is displayed on a small screen, false otherwise
  isDisplayedOnSmallScreen: boolean;

  chapterWiseConfig = {
    yAxisValueType: '',
    yAxisLabel: ''
  };

  constructor(
    private courseDataService: CourseDataService,
    private classDataService: ClassDataService,
    private utilsService: UtilsService,
    private tocService: TocService,
    private appDataService: AppDataService,
    private classAnalyticsService: ClassAnalyticsService,
    elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
    // this.timeMode = 'sevenDays';
    this.timeMode = 'lastMonth';
    
    this.isDisplayedOnSmallScreen = jQuery(this.elementRef.nativeElement).width() < this.SMALL_SCREEN_OFFSET;

    // for chapter wise time spent
    this.fetchTimeGraphData();
    this.tocService.fetchToc(true, true, true, this.courseDataService.getProductId())
      .then((toc) => {
        let i = 0;
        for (const chapter of toc) {
          let chapterTimeSpent = 0;
          for (const section of chapter.items) {
            chapterTimeSpent += section['__analytics']['timespent'];
          }
          this.chapterWiseData.push({
            name: chapter.name,
            timespent: chapterTimeSpent,
            displayName: 'Chapter ' + (++i)
          });
        }
      });
  }

  ngOnInit() {
    this.bindEvents();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.seriesData = {};
  }

  // Set flot graph to Bar type
  changeFlotToBar(barWidth) {
    // Early return if already bar
    if (this.flotOptions['bars']) {
      return;
    }

    // Clean up line
    if (this.flotOptions.series['lines']) {
      delete this.flotOptions.series['lines'];
    }
    if (this.flotOptions.series['points']) {
      delete this.flotOptions.series['points'];
    }

    // Add bar
    this.flotOptions.series['bars'] = {
      show: true,
      fill: true
    };
    this.flotOptions['bars'] = {
      align: 'center',
      barWidth: barWidth
    };
  }

  // Set flot graph to line type
  changeFlotToLine() {
    // Early return if already line
    if (this.flotOptions.series['lines']) {
      return;
    }

    // Clean up bar
    if (this.flotOptions.series['bars']) {
      delete this.flotOptions.series['bars'];
    }
    if (this.flotOptions['bars']) {
      delete this.flotOptions['bars'];
    }

    // Add line
    this.flotOptions.series['lines'] = {
      show: true,
      fill: true
    };
    this.flotOptions.series['points'] = {
      show: true
    };
  }

  // timeMode: Enum ['month', 'day']
  // Gets called when user is inside the 'Overall' tab
  updateForTimeSeries() {

    this.flotOptions['yaxis'] = {
      position: 'left',
      axisLabelUseCanvas: true,
      axisLabelPadding: 3,
      min: 0
    };
    if ( !this.timeModeList[this.timeMode].flotOptions.yaxis.yAxisValueType ) {
      this.setYAxisTickDetails();
    }
    this.flotOptions['yaxis'].axisLabel = this.timeModeList[this.timeMode].flotOptions.yaxis.axisLabel;

    this.flotOptions['xaxis'] = {
      mode: 'time',
      tickSize: [1, 'month'],
      timeformat: '%b',
      axisLabel: 'Duration',
      axisLabelUseCanvas: true,
      axisLabelPadding: 6
    };

    if (this.isDisplayedOnSmallScreen && this.timeModeList[this.timeMode].flotOptions_smallResolution) {
      this.flotOptions['xaxis'].tickSize = this.timeModeList[this.timeMode].flotOptions_smallResolution.tickSize;
      this.flotOptions['xaxis'].timeformat = this.timeModeList[this.timeMode].flotOptions_smallResolution.timeformat;
      // this.flotOptions['yaxis'].tickSize = this.timeModeList[this.timeMode].flotOptions_smallResolution.tickSize;
    } else {
      this.flotOptions['xaxis'].tickSize = this.timeModeList[this.timeMode].flotOptions.tickSize;
      this.flotOptions['xaxis'].timeformat = this.timeModeList[this.timeMode].flotOptions.timeformat;
      // this.flotOptions['yaxis'].tickSize = this.timeModeList[this.timeMode].flotOptions.tickSize;
    }

    this.flotOptions['xaxis'].timezone = 'browser';
    this.changeFlotToLine();
  }

  // Gets called when user is inside 'Chapter-wise' tab
  updateForChapterWise() {
    this.flotOptions['yaxis'] = {
      axisLabel: 'Time (mins)',
      position: 'left',
      axisLabelUseCanvas: true,
      axisLabelPadding: 3,
      min: 0
    };

    this.flotOptions['xaxis'] = {
      minTickSize: 1,
      axisLabel: 'Chapter',
      axisLabelUseCanvas: true,
      axisLabelPadding: 6,
      tickDecimals: 0
    };
    this.changeFlotToBar(0.5);
  }

  plotGraph() {
    const $graphContainer = jQuery(this.elementRef.nativeElement).find('.time-spent-graph');
    if (this.mode === 'overall') {
      this.updateForTimeSeries();
      jQuery.plot($graphContainer, [this.seriesData[this.timeMode]], this.flotOptions);
    } else {
      this.updateForChapterWise();
      jQuery.plot($graphContainer, [this.getChapterWiseFlotData()], this.flotOptions);
    }
    this.loading = false;
  }

  getInterval() {
    const currentDate = Date.now();
    if (currentDate - 7776000000 > this.courseStartDate) { // if current date - 3 months > course start date
      return 'month';
    } else if (currentDate - 259200000 > this.courseStartDate) { // if current date - 3 days > course start date
      return 'day';
    }
  }

  getChapterWiseFlotData() {
    let data = [];
    let i = 0;
    for (const chapter of this.chapterWiseData) {
      data.push([i + 1, moment.duration(chapter.timespent, 'milliseconds').asMinutes()]);
      i++;
    }
    const yAxisValueType: YAxisValueType = this.getYAxisValueType(data);

    switch (yAxisValueType) {
      case YAxisValueType.Days:
        data = data.map(val => {
          return [val[0], moment.duration(val[1], 'minutes').asDays()];
        });
        this.flotOptions['yaxis'].axisLabel = this.chapterWiseConfig.yAxisLabel = 'Time (days)';
        this.chapterWiseConfig.yAxisValueType = YAxisValueType.Days;
        break;

      case YAxisValueType.Hours:
        data = data.map(val => {
          return [val[0], moment.duration(val[1], 'minutes').asHours()];
        });
        this.flotOptions['yaxis'].axisLabel = this.chapterWiseConfig.yAxisLabel = 'Time (hrs)';
        this.chapterWiseConfig.yAxisValueType = YAxisValueType.Hours;
        break;

      default:
        this.flotOptions['yaxis'].axisLabel = this.chapterWiseConfig.yAxisLabel = 'Time (mins)';
        this.chapterWiseConfig.yAxisValueType = YAxisValueType.Minutes;
    }

    return data;
  }

  fetchTimeGraphData() {
    if (this.seriesData[this.timeMode] && this.seriesData[this.timeMode].length !== 0) {
      this.plotGraph();
    } else {
      this.loadingTimeMode = true;
      //Use class data service to get total time spent of class
      this.classAnalyticsService.getClassTotalTimeSpent(
        this.courseDataService.getProductId(),
        'timeseries',
        this.getStartDate().getTime(),
        this.timeModeList[this.timeMode].interval,
        'timespent',
        undefined,
        this.appDataService.getUserRole()
      ).then((timeseries) => {
        this.seriesData[this.timeMode] = [];
        for (const instance of timeseries.result) {
          this.seriesData[this.timeMode].push([
            this.removeStartOffset(instance.timestamp),
            moment.duration(instance.value, 'milliseconds').asMinutes()
          ]);
        }
        this.loadingTimeMode = false;
        this.plotGraph();
      });
    }
  }

  getYAxisValueType(flotData: Array<Array<any>>): YAxisValueType {
    // Assumes values are already in minutes.
    const day_mins = 24 * 60;
    const hr_mins = 60;

    let dayCount = 0, hrCount = 0, minCount = 0;

    if ( !flotData || flotData.length === 0 ) {
      return null;
    }

    flotData.forEach(val => {
      if ( val[1] > day_mins ) {
        dayCount++;
      } else if ( val[1] > hr_mins ) {
        hrCount++;
      } else {
        if ( val[1] !== 0 ) {
          minCount++;
        }
      }
    });

    return dayCount >= minCount || hrCount >= minCount
      ? dayCount > hrCount ? YAxisValueType.Days : YAxisValueType.Hours
      : YAxisValueType.Minutes;
  }

  setYAxisTickDetails(): void {
    const yAxisValueType: YAxisValueType = this.getYAxisValueType(this.seriesData[this.timeMode]);

    switch (yAxisValueType) {
      case YAxisValueType.Days:
        this.seriesData[this.timeMode] = this.seriesData[this.timeMode].map(val => {
          return [val[0], moment.duration(val[1], 'minutes').asDays()];
        });
        this.timeModeList[this.timeMode].flotOptions.yaxis.axisLabel = 'Time (days)';
        this.timeModeList[this.timeMode].flotOptions.yaxis.yAxisValueType = YAxisValueType.Days;
        break;

      case YAxisValueType.Hours:
        this.seriesData[this.timeMode] = this.seriesData[this.timeMode].map(val => {
          return [val[0], moment.duration(val[1], 'minutes').asHours()];
        });
        this.timeModeList[this.timeMode].flotOptions.yaxis.axisLabel = 'Time (hrs)';
        this.timeModeList[this.timeMode].flotOptions.yaxis.yAxisValueType = YAxisValueType.Hours;
        break;

      default:
        this.timeModeList[this.timeMode].flotOptions.yaxis.axisLabel = 'Time (mins)';
        this.timeModeList[this.timeMode].flotOptions.yaxis.yAxisValueType = YAxisValueType.Minutes;
    }
  }

  onModeChange(mode) {
    if (mode === 'overall') {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_TIME_SPENT_OVERALL');
    } else if (mode === 'chapterWise') {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_TIME_SPENT_CHAPTER_WISE');
    }
    this.mode = mode;
    this.plotGraph();
  }

  onTimeModeChange() {
    this.timeMode = jQuery(this.elementRef.nativeElement).find('#timeSpentModeDropDown').val();
    const interval = this.timeModeList[this.timeMode].displayName.split(' ').join('_').toUpperCase();
    this.appDataService.gaEventTrack('SERVO_SYSTEM_TIME_SPENT_CHAPTER_WISE_INTERVAL', interval);
    this.fetchTimeGraphData();
  }

  getStartDate() {
    const intervalStartDate = new Date();
    switch (this.timeMode) {
      case 'lastYear':
        intervalStartDate.setFullYear(intervalStartDate.getFullYear() - 1);
        break;
      case 'sixMonths':
        intervalStartDate.setMonth(intervalStartDate.getMonth() - 6);
        break;
      case 'threeMonths':
        intervalStartDate.setMonth(intervalStartDate.getMonth() - 3);
        break;
      case 'lastMonth':
        intervalStartDate.setMonth(intervalStartDate.getMonth() - 1);
        break;
      case 'sevenDays':
        intervalStartDate.setDate(intervalStartDate.getDate() - 7);
        break;
      case 'twoDays':
        intervalStartDate.setDate(intervalStartDate.getDate() - 2);
        break;
      case 'oneDay':
        intervalStartDate.setDate(intervalStartDate.getDate() - 1);
        break;
      case 'twelveHours':
        intervalStartDate.setHours(intervalStartDate.getHours() - 12);
        break;
      case 'sixHours':
        intervalStartDate.setHours(intervalStartDate.getHours() - 6);
        break;
      case 'threeHours':
        intervalStartDate.setHours(intervalStartDate.getHours() - 3);
        break;
      case 'oneHour':
        intervalStartDate.setHours(intervalStartDate.getHours() - 1);
        break;
    }
    return intervalStartDate;
  }

  removeStartOffset(timestamp) {
    switch (this.timeMode) {
      case 'lastYear':
        return moment(timestamp).startOf('month').valueOf();
      case 'sixMonths':
        return moment(timestamp).startOf('month').valueOf();
      case 'threeMonths':
        return moment(timestamp).startOf('month').valueOf();
      case 'lastMonth':
        return moment(timestamp).startOf('day').valueOf();
      case 'sevenDays':
        return moment(timestamp).startOf('day').valueOf();
      case 'twoDays':
        return moment(timestamp).startOf('hour').valueOf();
      case 'oneDay':
        return moment(timestamp).startOf('hour').valueOf();
      case 'twelveHours':
        return moment(timestamp).startOf('hour').valueOf();
      case 'sixHours':
        return moment(timestamp).startOf('hour').valueOf();
      case 'threeHours':
        return moment(timestamp).startOf('hour').valueOf();
      case 'oneHour':
        return moment(timestamp).startOf('minute').valueOf();
    }
    return timestamp;
  }

  private bindEvents() {
    let previousPoint = null;
    const $graphContainer = jQuery(this.elementRef.nativeElement).find('.time-spent-graph');
    $graphContainer.bind('plothover', (event, pos, item) => {
      jQuery('#x').text(pos.x.toFixed(2));
      jQuery('#y').text(pos.y.toFixed(2));
      if (item) {
        if (previousPoint != item.dataIndex && item.series.data) {
          previousPoint = item.dataIndex;
          jQuery('#tooltip').remove();
          this.showTooltip(item.pageX, item.pageY, item.series.data[item.dataIndex]);
        }
      }
      else {
        jQuery('#tooltip').remove();
        previousPoint = null;
      }
    });

    // Listen for changes to TimeSpent component's width
    jQuery(this.elementRef.nativeElement).resize((e) => {
      const currentWindowWidth = jQuery(this.elementRef.nativeElement).width();
      // Dont care if moving from small screen to small screen
      // if moving from small screen to large screen
      if (this.SCREEN_DEPENDENT_TIMEMODE.indexOf(this.timeMode) > -1) {
        if (this.isDisplayedOnSmallScreen && currentWindowWidth > this.SMALL_SCREEN_OFFSET) {
          this.isDisplayedOnSmallScreen = false;
          this.plotGraph();
        }
        // Dont care if moving from large screen to large screen
        // if moving from large screen to small screen
        else if (!this.isDisplayedOnSmallScreen && currentWindowWidth < this.SMALL_SCREEN_OFFSET) {
          this.isDisplayedOnSmallScreen = true;
          this.plotGraph();
        }
      }
    });

  }

  private showTooltip(x, y, contents) {
    let tooltipContent = '';

    let yAxisValue = contents[1];
    const yAxisValueType = this.mode === 'overall' ? this.timeModeList[this.timeMode].flotOptions.yaxis.yAxisValueType : this.chapterWiseConfig.yAxisValueType;
    switch (yAxisValueType) {
      case YAxisValueType.Days: yAxisValue = moment.duration(yAxisValue, 'days').asMilliseconds();
        break;
      case YAxisValueType.Hours: yAxisValue = moment.duration(yAxisValue, 'hours').asMilliseconds();
        break;
      default: yAxisValue = moment.duration(yAxisValue, 'minutes').asMilliseconds();
    }

    tooltipContent += 'Time spent: ' + this.utilsService.convertMillisecondsToDyHrMin(yAxisValue);
    if (this.mode === 'chapterWise') {
      tooltipContent += '<br/>';
      tooltipContent += 'Chapter: ' + contents[0];
    } else {
      tooltipContent += '<br/>';
      const monthArray = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (this.timeModeList[this.timeMode].interval === 'month') {
        tooltipContent += 'Month: ' + monthArray[new Date(contents[0]).getMonth()];
      } else if (this.timeMode === 'lastMonth') {
        tooltipContent += 'Date: ' + new Date(contents[0]).getDate() + ' ' + monthArray[new Date(contents[0]).getMonth()];
      } else if (this.timeModeList[this.timeMode].interval === 'day') {
        tooltipContent += 'Day: ' + weekArray[new Date(contents[0]).getDay()];
      } else if (this.timeModeList[this.timeMode].interval === 'hour' || this.timeModeList[this.timeMode].interval === 'five_minutes') {
        tooltipContent += 'Time: ' + this.utilsService.formatAMPM(contents[0]);
      }
    }

    const ww = jQuery(window).width();
    const tooltip_width = 200; // Presumed minimum width of tooltip.
    const x_offset = 15; // Amount by which tooltip should shift to the right of graph data point
    const y_offset = 15; // Amount by which tooltip should shift to the bottom of graph data point
    let top = 0, left = 0;

    // Check if overflow will occur
    if (x + tooltip_width + x_offset > ww) {
      // Substract the overflowed amount from X coordinate
      left = x - (x + tooltip_width + x_offset - ww);
    } else {
      // Just add the offset if no overflow will occur
      left = x + x_offset;
    }
    top = y + y_offset;

    $('<div id="tooltip">' + tooltipContent + '</div>').css({
      'color': '#ffffff',
      'position': 'absolute',
      'display': 'none',
      'top': top,
      'left': left,
      'padding': '4px 10px',
      'background-color': 'rgba(0, 0, 0, 0.8)',
      'opacity': 0.70,
      'border': 'solid 1px #000',
      'border-radius': '3px'
    }).appendTo('body').fadeIn(200);
  }
}
