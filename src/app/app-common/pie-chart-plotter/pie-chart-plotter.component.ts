import { Component, OnInit, AfterViewInit, Input, ElementRef } from '@angular/core';

// declare let jQuery: any;

@Component({
  selector: 'app-pie-chart-plotter',
  templateUrl: './pie-chart-plotter.component.html',
  styleUrls: ['./pie-chart-plotter.component.scss']
})
export class PieChartPlotterComponent implements OnInit, AfterViewInit {
  @Input() pieChartDataTemp: any;
  chartDataKeys: string[];
  $el: any;
  constructor(el: ElementRef) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit() {
    this.chartDataKeys = Object.keys(this.pieChartDataTemp);
    for ( const key of this.chartDataKeys ) {
      if ( this.pieChartDataTemp[key]['total'] === 0 ) {
        this.pieChartDataTemp[key]['percentage'] = 0;
      } else {
        this.pieChartDataTemp[key]['percentage'] = Math.round(100 * ( this.pieChartDataTemp[key]['completed'] / this.pieChartDataTemp[key]['total'] ));
      }
    }
  }

  ngAfterViewInit() {
    // draw pie chart
    this.$el.find('.chart').easyPieChart({
      barColor: '#F2BE35',
      trackColor: '#9E9E9E',
      scaleColor: false,
      lineWidth: 7,
      size: 60,
      lineCap: 'butt'
    });
  }

}
