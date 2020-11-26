/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import {
  Headers, BaseRequestOptions,
  Response, HttpModule, Http, XHRBackend, RequestMethod
} from '@angular/http';
import { ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { AuthService } from './auth.service';
import { AppDataService } from '../services/app-data.service';

describe('AuthService', () => {
  let subject: AuthService;
  let backend: MockBackend;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AppDataService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory:
          (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        }
      ],
      imports: [
        HttpModule
      ]
    });
  });

  beforeEach(inject([AuthService, MockBackend], (authService: AuthService, mockBackend: MockBackend) => {
    subject = authService;
    backend = mockBackend;
  }));

  it('#login() should get access token on correct credentials',
    async(() => {
      backend.connections.subscribe(
        (connection: MockConnection) => {
          connection.mockRespond(new Response(
            new ResponseOptions({
              body: {
                "access_token": "YWMtZP6yzuebEea2oYOb2cTDsgAAAVoX_9stnztrUqMC",
                "user": {
                  "name": "admin",
                  "uuid": "8e594f62-ccc5-11e6-a329-0e34ffe5d91e",
                  "roles": {
                    "student": [
                      "i/users/view"
                    ]
                  },
                  "email": "student105@gmail.com",
                  "org": {
                    "id": "cosmatt",
                    "type": "consumer"
                  }
                },
                "expires_in": 604800,
                "refresh_token": "d212ca7c0926729a6c319ef345010eeb95f94f1f10a6acc10b673527361628da6c8"
              }
            })));
        });
      subject.login("admin", "correct_password")
        .then((res) => {
          expect(res.access_token).toBeDefined();;
          expect(res.user.name).toBe("admin");
        })
    }));

  it('#login() should get error response on incorrect credentials',
    async(() => {
      backend.connections.subscribe(
        (connection: MockConnection) => {
          connection.mockRespond(new Response(
            new ResponseOptions({
              body: {
                "statusCode": 401,
                "dbErrorBody": "invalid_grant",
                "dbErrorDescription": "invalid username or password",
                "message": "Invalid Credentials",
                "name": "DBInvalidCredentials"
              },
              status: 401
            })));
        });
      subject.login("admin", "incorrect_password")
        .then((res) => {
          expect(res.statusCode).toBe(401);
        })
    }));


  it('#isLoggedIn() should return false on #logout()',
    async(() => {
      backend.connections.subscribe(
        (connection: MockConnection) => {
          connection.mockRespond(new Response(
            new ResponseOptions({
              body: null,
              status: 204
            })));
        });
      subject.logout()
        .then(() => {
          expect(subject.isLoggedIn()).toBeFalsy();
        })
    }));
});
