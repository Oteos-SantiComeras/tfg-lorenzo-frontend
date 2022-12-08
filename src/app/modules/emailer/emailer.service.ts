import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import environment from 'src/environments/environment';
import { Message } from './model/message';

@Injectable({
  providedIn: 'root'
})
export class EmailerService {

  constructor(
    private http: HttpClient
  ) {}

  sendMail(message: Message): Observable<boolean> {
    return this.http.post<boolean>(environment.apiUrl + '/emailer/', message)
  }
}
