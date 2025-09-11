import {Injectable} from "@angular/core";
import {map, Observable, switchMap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {environment} from "../../../environments/environment";

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
  userData?: {
    isEvaluated: boolean;
    isFavorite: boolean;
    evaluation?: any;
  };
}

export interface CreateEventInput {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  time?: number; // Cambiado a number para duración en minutos
  location: string;
  locationLink?: string;
  speakers: string[];
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
  includeUserData?: boolean;
}

export interface Favorite {
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface FavoriteResponse {
  success: boolean;
  data: Favorite;
}

export interface FavoritesResponse {
  success: boolean;
  data: {
    items: Favorite[];
    count: number;
  };
}

@Injectable({providedIn: 'root'})
export class EventsService {
  private readonly baseUrl = `${environment.apiUrl}`;

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
        if (params?.includeUserData) queryParams.set('includeUserData', 'true');

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

  createEvent(eventData: CreateEventInput): Observable<Event> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/events`;
        return this.http.post<{ success: boolean, data: Event }>(url, eventData, {headers}).pipe(
          map(response => response.data)
        );
      })
    );
  }

  // Favorites methods
  addFavorite(eventId: string): Observable<Favorite> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/favorites`;
        return this.http.post<FavoriteResponse>(url, { eventId }, {headers}).pipe(
          map(response => response.data)
        );
      })
    );
  }

  removeFavorite(eventId: string): Observable<{ success: boolean }> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/favorites/${eventId}`;
        return this.http.delete<{ success: boolean }>(url, {headers});
      })
    );
  }

  getFavorites(): Observable<Favorite[]> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/favorites`;
        return this.http.get<FavoritesResponse>(url, {headers}).pipe(
          map(response => response.data.items)
        );
      })
    );
  }

  // Convenience methods for events with user data
  getEventsWithUserData(params?: Omit<EventsParams, 'includeUserData'>): Observable<EventsResponse> {
    return this.getEvents({ ...params, includeUserData: true });
  }

  getUpcomingEventsWithUserData(limit?: number, lastKey?: string): Observable<EventsResponse> {
    return this.getEvents({ upcoming: true, limit, lastKey, includeUserData: true });
  }

  getPastEventsWithUserData(limit?: number, lastKey?: string): Observable<EventsResponse> {
    return this.getEvents({ past: true, limit, lastKey, includeUserData: true });
  }
}
