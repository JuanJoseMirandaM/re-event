import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  getVersion(): string {
    return '0.0.12';
  }

  getAppName(): string {
    return 'Kinua';
  }

  getVersionInfo(): { name: string; version: string; buildDate: string } {
    return {
      name: this.getAppName(),
      version: this.getVersion(),
      buildDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
  }
}
