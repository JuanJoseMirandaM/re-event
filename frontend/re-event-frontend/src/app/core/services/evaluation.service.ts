import {Injectable} from "@angular/core";
import {map, Observable, switchMap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {environment} from "../../../environments/environment";

export interface Evaluation {
  evaluationId: string;
  sessionId: string;
  userId: string;
  rating: number;
  npsScore?: number;
  comments?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  createdAt: string;
}

export interface EvaluationResponse {
  items: Evaluation[];
  lastKey: string | null;
  count: number;
}

export interface SingleEvaluationResponse {
  evaluationId: string;
  sessionId: string;
  userId: string;
  rating: number;
  npsScore?: number;
  comments?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  createdAt: string;
}

export interface CreateEvaluationRequest {
  sessionId: string;
  rating: number;
  npsScore?: number;
  comments?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  event?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
  }

  createEvaluation(evaluation: CreateEvaluationRequest): Observable<Evaluation> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });
        
        const url = `${this.baseUrl}/evaluations`;
        return this.http.post<ApiResponse<Evaluation>>(url, evaluation, {headers}).pipe(
          map(response => response.event!)
        );
      })
    );
  }

  getEvaluation(sessionId: string): Observable<SingleEvaluationResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });
        
        const url = `${this.baseUrl}/evaluations?sessionId=${sessionId}`;
        return this.http.get<ApiResponse<SingleEvaluationResponse>>(url, {headers}).pipe(
          map(response => response.data!)
        );
      })
    );
  }

  getEvaluationsBySession(sessionId: string): Observable<EvaluationResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });
        
        const url = `${this.baseUrl}/evaluations/session/${sessionId}`;
        return this.http.get<ApiResponse<EvaluationResponse>>(url, {headers}).pipe(
          map(response => response.data!)
        );
      })
    );
  }

  getUserEvaluations(): Observable<EvaluationResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });
        
        const url = `${this.baseUrl}/evaluations/user`;
        return this.http.get<ApiResponse<EvaluationResponse>>(url, {headers}).pipe(
          map(response => response.data!)
        );
      })
    );
  }
}
