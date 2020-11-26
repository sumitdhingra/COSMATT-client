import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GooglePickerDirective } from './google-picker.directive';
import { GoogleDriveClientService } from './services/google-drive-client.service';
import { SaveToDiskService } from './services/save-to-disk.service';
import { ReadFromDiskDirective } from './read-from-disk.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    GoogleDriveClientService,
    SaveToDiskService
  ],
  declarations: [
    GooglePickerDirective,
    ReadFromDiskDirective
  ],
  exports: [
    GooglePickerDirective,
    ReadFromDiskDirective
  ]
})
export class FileStoreModule { }
