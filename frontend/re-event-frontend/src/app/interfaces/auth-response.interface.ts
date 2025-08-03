export interface User {
  email: string;
  name: string;
  company: string;
  phone: string;
  role: 'ATTENDEE' | 'SPEAKER' | 'SPONSOR' | 'VOLUNTEER' | 'ORGANIZER';
  verified: boolean;
  points: number;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: {
    code: string;
    message: string;
  };
}
