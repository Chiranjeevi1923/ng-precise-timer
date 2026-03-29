import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { DeadlineResponse } from './../interfaces/deadline.interface';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private http = inject(HttpClient);

  // private readonly DEADLINE_API_URL = '/api/deadline'; // Replace with your actual API endpoint
  private readonly DEADLINE_API_URL = 'https://mocki.io/v1/edf07abf-b8c4-48bb-8903-76592d09973b'; // Mock API for testing

  getDeadlineDuration(): Observable<DeadlineResponse> {
    return this.http.get<DeadlineResponse>(this.DEADLINE_API_URL);
  }

}
