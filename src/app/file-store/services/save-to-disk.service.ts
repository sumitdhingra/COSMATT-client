import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';


@Injectable()
export class SaveToDiskService {

  constructor() { }

  save(filename: string, data: string) {
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `${filename}.json`);
  }
}
