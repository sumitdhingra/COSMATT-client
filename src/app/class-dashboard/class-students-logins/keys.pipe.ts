import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe2 implements PipeTransform {

  transform(value: any, args: any[] = null): any {
    return Object.keys(value)
  }

}
