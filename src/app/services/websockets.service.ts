import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { fromEvent, Observable } from "rxjs";
import { map } from "rxjs/operators";
import environment from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})

export class WsBackendService extends Socket {
  
  constructor() {
    /* super({
      url: environment.serverSocketUrl,
      options: {},
    }); */
    super({
      url: `${environment.hostname}:${environment.webSocketPort}`,
      options: {},
    });
    
    this.on('connect', () => {
      console.log('Conexión con Backend');
    });
    this.on('connect_error', () => {
      console.log('No se pudo conectar al Backend');
    });
  }

  /**
   * @param event event sent
   * @param data optional data to send along with the event
   */
  sendMessage(event: string, data?: any): void {
    if (data) {
      this.emit(event, data);
    } else {
      this.emit(event);
    }
  }

  /**
   * @param event event received
   */
  getMessage(event: string): Observable<any> {
    return fromEvent(this.ioSocket,event).pipe(map((data: any) => data));
  }

  removeListenerMessage(event: string){
    this.removeListener(event);
  }
}
