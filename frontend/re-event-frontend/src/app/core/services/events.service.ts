import {Injectable} from "@angular/core";
import {map, Observable, switchMap} from "rxjs";
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

export interface EventsResponse {
  items: Event[];
  lastKey: string | null;
  count: number;
}

export interface ApiResponse {
  success: boolean;
  data: EventsResponse;
}

export interface EventsParams {
  limit?: number;
  lastKey?: string;
  upcoming?: boolean;
  past?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
  }

  getEvents(params?: EventsParams): Observable<EventsResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.lastKey) queryParams.set('lastKey', params.lastKey);
        if (params?.upcoming) queryParams.set('upcoming', 'true');
        if (params?.past) queryParams.set('past', 'true');

        const url = `${this.baseUrl}/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return this.http.get<ApiResponse>(url, {headers}).pipe(
          map(response => response.data)
        );
      })
    );
  }

  getUpcomingEvents(limit?: number, lastKey?: string): Observable<EventsResponse> {
    return this.getEvents({upcoming: true, limit, lastKey});
  }

  getPastEvents(limit?: number, lastKey?: string): Observable<EventsResponse> {
    return this.getEvents({past: true, limit, lastKey});
  }
}
