import {Injectable} from "@angular/core";
import {Observable, switchMap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";

export interface Event {
  eventId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  time: number;
  location: string;
  locationLink: string;
  speakers: any[];
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
  }

  getEvents(): Observable<Event[]> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });
        return this.http.get<Event[]>(`${this.baseUrl}/events`, {headers});
      })
    );
  }
}
