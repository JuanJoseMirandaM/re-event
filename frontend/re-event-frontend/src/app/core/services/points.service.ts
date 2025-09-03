import {Injectable} from "@angular/core";
import {catchError, map, Observable, of, switchMap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";

export interface PointsClaim {
  userId: string;
  timestamp: string;
  code: string;
  points: number;
  sourceType: 'QR_CODE' | 'COLLECTIBLE_CARD' | 'deduction';
  description?: string;
  organizerId?: string;
}

export interface PointsHistoryResponse {
  items: PointsClaim[];
  lastKey: string | null;
  count: number;
}

export interface TotalPointsResponse {
  totalPoints: number;
}

export interface ClaimPointsRequest {
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PointsParams {
  limit?: number;
  lastKey?: string;
  sourceType?: 'QR_CODE' | 'COLLECTIBLE_CARD' | 'deduction';
}

export interface ClaimPointsResponse {
  claimedAt: string;
  code: string;
  description: string;
  pointsEarned: number;
  sourceType: string;
  totalPoints: number;
}

export interface DeductPointsRequest {
  targetUserId: string;
  points: number;
  description: string;
}

export interface DeductPointsResponse {
  pointsDeducted: number;
  totalPoints: number;
  targetUserId: string;
  description: string;
  deductedAt: string;
  organizerId: string;
}

@Injectable()
export class PointsService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
  }

  claimPoints(code: string): Observable<ClaimPointsResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/points/claim`;
        const request: ClaimPointsRequest = {code};

        return this.http.post<ApiResponse<ClaimPointsResponse>>(url, request, {headers}).pipe(
          map(response => response.data!)
        );
      })
    );
  }

  deductPoints(targetUserId: string, points: number, description: string): Observable<DeductPointsResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/points/deduct`;
        const request: DeductPointsRequest = {
          targetUserId,
          points,
          description
        };

        return this.http.post<ApiResponse<DeductPointsResponse>>(url, request, {headers}).pipe(
          map(response => response.data!)
        );
      })
    );
  }

  getPointsHistory(params?: PointsParams): Observable<PointsHistoryResponse> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.lastKey) queryParams.set('lastKey', params.lastKey);
        if (params?.sourceType) queryParams.set('sourceType', params.sourceType);

        const url = `${this.baseUrl}/points/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return this.http.get<ApiResponse<PointsHistoryResponse>>(url, {headers})
          .pipe(map(r => r.data!));
      })
    );
  }


  getTotalPoints(): Observable<number> {
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: token,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/points/total`;
        return this.http.get<ApiResponse<TotalPointsResponse>>(url, {headers}).pipe(
          map(response => {
            return response.data && response.data.totalPoints ? response.data.totalPoints : 0;
          }),
          catchError(error => {
            return of(0);
          })
        );
      })
    );
  }

  // Helper method to format points
  formatPoints(points: number): string {
    return points.toLocaleString('es-ES');
  }

  // Helper method to get source type icon
  getSourceTypeIcon(sourceType: string): string {
    const icons = {
      'QR_CODE': 'qr_code',
      'COLLECTIBLE_CARD': 'style',
      'deduction': 'remove_shopping_cart'
    };
    return icons[sourceType as keyof typeof icons] || 'help';
  }

  // Helper method to get source type color
  getSourceTypeColor(sourceType: string): string {
    const colors = {
      'QR_CODE': '#10B981', // green
      'COLLECTIBLE_CARD': '#8B5CF6', // purple
      'deduction': '#EF4444' // red
    };
    return colors[sourceType as keyof typeof colors] || '#6B7280';
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper method to validate code format
  isValidCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code);
  }

  // Helper method to get points level
  getPointsLevel(points: number): { level: string; color: string; icon: string } {
    if (points >= 1000) {
      return {level: 'Legendario', color: '#FFD700', icon: 'stars'};
    } else if (points >= 500) {
      return {level: 'Épico', color: '#8B5CF6', icon: 'workspace_premium'};
    } else if (points >= 200) {
      return {level: 'Raro', color: '#3B82F6', icon: 'diamond'};
    } else if (points >= 100) {
      return {level: 'Común', color: '#10B981', icon: 'emoji_events'};
    } else {
      return {level: 'Novato', color: '#6B7280', icon: 'school'};
    }
  }
}
