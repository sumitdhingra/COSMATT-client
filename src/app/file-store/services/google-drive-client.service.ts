import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';


declare const gapi: any;

@Injectable()
export class GoogleDriveClientService {

  constructor(private http: Http) { }

  getFile(id: string): Promise<any> {
    return gapi.client.drive.files.get({
      fileId: id,
      alt: 'media'
    }).then(function (response) {
      switch (response.status) {
        case 200:
          return response.body;
        default:
          throw new Error(response);
      }
    });
  }
  updateFile(fileId: string, data: any): Promise<any> {
    const body = {
      data: JSON.stringify(data),
      accessToken: gapi.auth.getToken().access_token
    };
    const url = `${environment.API_URL}sizing-app/gdrive/file/${fileId}`;
    return this.http.put(url, body).toPromise().then((file) => {
      console.log('file updated', file);
    }).catch(err => {
      console.error(err);
    });
  }

  createFile(filename: string, folderId: string, data): Promise<any> {
    const body = {
      name: filename,
      data: JSON.stringify(data),
      folderId: folderId,
      accessToken: gapi.auth.getToken().access_token
    };
    const url = `${environment.API_URL}sizing-app/gdrive/file`;
    return this.http.post(url, body).toPromise().then((file) => {
      console.log('file created', file);
      return file;
    }).catch(err => {
      console.error(err);
    });
  }
}
