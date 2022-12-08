import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { WS_COMPANIES } from 'src/app/constants/websockets.constants';
import { WsBackendService } from 'src/app/services/websockets.service';
import environment from 'src/environments/environment';
import { Company } from './model/company';

@Injectable({
  providedIn: 'root'
})

export class CompaniesService {

  constructor(
    private http: HttpClient,
    private wsBackendService: WsBackendService
  ) { }

  fetchCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(environment.apiUrl + '/companies');
  }

  fetchCompanyByCompanyCode(companyCode: string): Observable<Company> {
    return this.http.get<Company>(`${environment.apiUrl}/companies/${companyCode}`);
  }

  createCompany(company: Company):Observable<Company> {
    return this.http.post<Company>(environment.apiUrl + '/companies/noAuth/', company)
  }

  /* Sockets */
  getCompaniesBySocket(): any {
    return this.wsBackendService.getMessage(WS_COMPANIES);
  }

  removeSocket(): any {
    this.wsBackendService.removeListenerMessage(WS_COMPANIES);
  }
}
