import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  public static readonly MIN_MILLISECONDS = 60 * 1000; // Millisenconds in a minute
  public static readonly HR_MILLISECONDS = UtilsService.MIN_MILLISECONDS * 60; // Millisenconds in an hour
  public static readonly DAY_MILLISECONDS = UtilsService.HR_MILLISECONDS * 24; // Milliseconds in a day
  public static readonly MONTH_MILLISECONDS = UtilsService.DAY_MILLISECONDS * 30; // Milliseconds in a month
  public static readonly YEAR_MILLISECONDS = UtilsService.MONTH_MILLISECONDS * 12; // Milliseconds in a year

  constructor() { }

  public convertMillisecondsToDyHrMin(milliseconds: number): string {

    if ( milliseconds <= 1000 ) {
      return '0 mins';
    } else if ( milliseconds > 1000 && milliseconds <= UtilsService.MIN_MILLISECONDS ) {
      return 'less than 1 min';
    } else {
      let seconds = Math.floor(milliseconds / 1000); // Maybe needed in future
      let mins = Math.floor(seconds / 60);
      let hrs = Math.floor(mins / 60);
      let days = Math.floor(hrs / 24);
      let timeString = '';

      if ( days > 0 ) {
        timeString += days === 1 ? '1 day ' : days + ' days ';
      }
      if ( hrs % 24 > 0 ) {
        timeString += (hrs % 24) === 1 ? '1 hr ' : (hrs % 24) + ' hrs ';
      }
      if ( mins % 60 > 0 ) {
        timeString += (mins % 60) === 1 ? '1 min' : (mins % 60) + ' mins';
      }

      return timeString;
    }
  }

  public convertDateUtcToDateString(dateUtcNumber: number): string {
    const monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'];
    let date = new Date(dateUtcNumber);
    let dateString = monthsArr[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    return dateString;
  }

  public getDaysElapsed(startTime: number){
    const ONE_DAY_MILLISECONDS = 1000 * 60 * 60 * 24;
    let endTime = Date.now();
    let difference_ms = Math.abs(endTime - startTime)
    return Math.round(difference_ms/ONE_DAY_MILLISECONDS)
  }

  public formatAMPM(dateUtcNumber: number): string {
    let date = new Date(dateUtcNumber);
    let hours: any = date.getHours();
    let minutes: any = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  public getQueryParams(paramNames?: Array<string>): {[key: string]: any} {
    // Early return if there is no search string
    if ( !window.location.search ) {
      return null;
    } else {
      // Need to update typescript to get forEach working with `any` cast
      // But then, angular 4 doesn't support updated typescript.
      // TODO - Remove `any` cast after updating typescript & angular
      const searchParams: any = new URLSearchParams(window.location.search);
      const queryParams = {};

      // if we want only particular param values
      if ( paramNames && paramNames.length ) {
        for ( const param of paramNames ) {
          queryParams[param] = searchParams.get(param);
        }
        return queryParams;
      } else {
        // Needed because of above comment
        // tslint:disable-next-line
        searchParams.forEach((value, name) => {
          queryParams[name] = value;
        });
        return queryParams;
      }

    }
  }

  public stripQueryParams(url: string) {
    return url.split('?')[0];
  }

  public getMappedLOs(loIDAry: any[], loResourceAry: any[]){
    // Using try-catch to check for correct JSON structure, otherwise "JSON.parse()" will throw error
    try{
      loResourceAry = JSON.parse(JSON.stringify(loResourceAry['learning-objectives']));
    }catch (error){
      console.log(error);
      return;
    }
    let mappedLOsAry = this.getLOs(loIDAry, loResourceAry);
    return mappedLOsAry;
  }


  private getLOs(loIDAry: any[], loResourceAry: any[]){
    // Base case of recursive code
    if(!loResourceAry || loResourceAry.length === 0){
      return [];
    }
    let mappedLOsAry: any[] = [];
    for(let i=0; i< loResourceAry.length; i++){
      loResourceAry[i]['learning-objectives'] = this.getLOs(loIDAry, loResourceAry[i]['learning-objectives']);
      // Selecting an LO object, only if its id is present in 'loIDAry' or it contains sub LO's array
      if((loIDAry.indexOf(loResourceAry[i]['id']) >= 0) || 
      (loIDAry.indexOf(loResourceAry[i]['id']) < 0 && loResourceAry[i]['learning-objectives'].length != 0)){
        mappedLOsAry.push(loResourceAry[i]);
      }
    }
    return mappedLOsAry;
  }
}
