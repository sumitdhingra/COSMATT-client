import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from 'app/services/utils.service';

@Pipe({
  name: 'millisecondsToDyHrMin'
})
export class MillisecondsToDyHrMinPipe implements PipeTransform {

  constructor(private utilService: UtilsService){}
  transform(value: any, args?: any): any {
    return this.utilService.convertMillisecondsToDyHrMin(value);
  }

}