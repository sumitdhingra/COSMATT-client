import { Directive, HostListener, Renderer, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { GooglePickerConfig } from './models/google-picker-config';
import { GoogleDriveClientService } from './services/google-drive-client.service';

declare const gapi: any;
declare const google: any;

@Directive({
  selector: '[appGooglePicker]'
})
export class GooglePickerDirective implements OnInit {

  @Input() googlePickerConfig: GooglePickerConfig;
  @Input() folderMode = false;
  @Output() onFileSelect = new EventEmitter<any>();
  @Output() onFolderSelect = new EventEmitter<any>();

  scope: string[] = ['https://www.googleapis.com/auth/drive'];
  cosmattMimeType: string;

  constructor(private googleDriveClient: GoogleDriveClientService, private domElement: ElementRef) {
  }

  ngOnInit() {
    this.domElement.nativeElement.disabled = true;
    this.cosmattMimeType = 'application/json';
    // Load the drive API
    gapi.client.setApiKey(this.googlePickerConfig.apiKey);
    gapi.client.load('drive', 'v3', this.driveApiLoaded.bind(this));
    gapi.load('picker', { callback: this.pickerApiLoaded.bind(this) });
  }

  @HostListener('click') onClick() {
    this.open();
  }

  open() {
    const token = gapi.auth.getToken();
    if (token) {
      this.showPicker();
    } else {
      this.authenticate(false, () => this.showPicker());
    }
  }

  private showPicker() {
    if (this.folderMode) {
      this.showFolderPicker();
    } else {
      this.showFilePicker();
    }
  }

  private showFilePicker() {
    const oauthToken = gapi.auth.getToken().access_token;
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes(this.cosmattMimeType);
    const picker = new google.picker.PickerBuilder()
      .setAppId(this.googlePickerConfig.appId)
      .setOAuthToken(oauthToken)
      .addView(view)
      .addView(new google.picker.View(google.picker.ViewId.RECENTLY_PICKED))
      .addView(new google.picker.DocsUploadView())
      .setSelectableMimeTypes(this.cosmattMimeType)
      .setDeveloperKey(this.googlePickerConfig.apiKey)
      .setCallback(this.pickerFileCallback.bind(this))
      .build();
    picker.setVisible(true);
  }

  private showFolderPicker() {
    const oauthToken = gapi.auth.getToken().access_token;
    const view = new google.picker.DocsView()
      .setIncludeFolders(true)
      .setMimeTypes('application/vnd.google-apps.folder')
      .setSelectFolderEnabled(true);
    const picker = new google.picker.PickerBuilder()
      .setAppId(this.googlePickerConfig.appId)
      .setOAuthToken(oauthToken)
      .addView(view)
      .addView(new google.picker.View(google.picker.ViewId.RECENTLY_PICKED))
      .setDeveloperKey(this.googlePickerConfig.apiKey)
      .setCallback(this.pickerFolderCallback.bind(this))
      .build();
    picker.setVisible(true);
  }

  /**
   * Called when a file has been selected in the Google Drive file picker.
   */
  pickerFileCallback(selectedFile: any) {
    if (selectedFile[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      const file = selectedFile[google.picker.Response.DOCUMENTS][0];
      this.onFileSelect.emit(file);
    }
  }


  pickerFolderCallback(selectedFolder: any) {
    if (selectedFolder[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      const folder = selectedFolder[google.picker.Response.DOCUMENTS][0];
      this.onFolderSelect.emit(folder);
    }
  }

  /**
   * Called when the Google Drive file picker API has finished loading.
   */
  pickerApiLoaded() {
    this.domElement.nativeElement.disabled = false;
  }

  /**
   * Called when the Google Drive API has finished loading.
   */
  driveApiLoaded() {
    this.authenticate(true);
  }

  authenticate(immediate, callback = null) {
    gapi.auth.authorize({
      client_id: this.googlePickerConfig.clienId,
      scope: this.scope,
      immediate: immediate
    }, callback);
  }

}
