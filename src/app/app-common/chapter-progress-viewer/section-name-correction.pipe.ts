import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sectionNameCorrection'
})
export class SectionNameCorrectionPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    return value.replace('/', '_');
  }

}
