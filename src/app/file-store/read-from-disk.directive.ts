import { Directive, HostListener, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({
  selector: '[appReadFromDisk]'
})
export class ReadFromDiskDirective {
  @Output() onFileRead = new EventEmitter<any>();
  constructor(private domElement: ElementRef) { }

  @HostListener('change') onChange() {
    const file = this.domElement.nativeElement.files[0];

    const pattern = /text\/plain|application\/json/;
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = this.handleFileLoaded.bind(this);
    reader.onerror = this.errorHandler.bind(this);
  }

  private handleFileLoaded(event) {
    const reader = event.target;
    this.onFileRead.emit(reader.result);
  }

  private errorHandler(event) {
    if (event.target.error.code === event.target.error.NOT_READABLE_ERR) {

    }
    alert('Error reading file!');
  }

}
