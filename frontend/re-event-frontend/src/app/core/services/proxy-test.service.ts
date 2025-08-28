import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxyTestService {

  constructor(private http: HttpClient) {}

  /**
   * Test simple del proxy - solo GET
   */
  testProxySimple(): Observable<any> {
    console.log('🔧 Probando proxy simple...');
    console.log('📡 URL: /presigned-api/');
    
    return this.http.get('/presigned-api/', {
      observe: 'response'
    });
  }

  /**
   * Test del endpoint completo
   */
  testProxyEndpoint(): Observable<any> {
    console.log('🔧 Probando endpoint completo...');
    console.log('📡 URL: /presigned-api/generate-presigned-url');
    
    return this.http.get('/presigned-api/generate-presigned-url', {
      observe: 'response'
    });
  }

  /**
   * Test con POST (como la petición real)
   */
  testProxyPost(): Observable<any> {
    console.log('🔧 Probando POST al proxy...');
    console.log('📡 URL: /presigned-api/generate-presigned-url');
    
    const testData = {
      fileName: 'test.jpg',
      type: 'to-rekognize'
    };
    
    return this.http.post('/presigned-api/generate-presigned-url', testData, {
      observe: 'response'
    });
  }

  /**
   * Test directo (sin proxy)
   */
  testDirect(): Observable<any> {
    console.log('🔧 Probando URL directa...');
    const directUrl = 'https://9mszstbuql.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url';
    console.log('📡 URL:', directUrl);
    
    const testData = {
      fileName: 'test.jpg',
      type: 'to-rekognize'
    };
    
    return this.http.post(directUrl, testData, {
      observe: 'response'
    });
  }
}