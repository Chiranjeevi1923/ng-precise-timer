import { Component, inject, signal } from '@angular/core';
import { PreciseTimerComponent } from './components/precise-timer/precise-timer.component';
import { TimerService } from './services/timer.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [PreciseTimerComponent, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private timerService = inject(TimerService);
  deadlineSubscription$: Subscription = new Subscription();
  isLoading = signal<boolean>(false);
  secondsLeft = signal<number>(0);

  ngOnInit() {
    this.fetchDeadline();
  }

  private fetchDeadline() {
    this.isLoading.set(true);
    this.deadlineSubscription$ = this.timerService.getDeadlineDuration().subscribe({
      next: ({ secondsLeft }) => {
        this.secondsLeft.set(secondsLeft);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching deadline duration', err);
        this.secondsLeft.set(60); // Default to 60 seconds on error
        this.isLoading.set(false);
      }
    });
  }

  handleTimeout() {
    console.log('You have ran out of time!');
    // Add any additional logic you want to execute when the timer finishes
  }

  ngOnDestroy() {
    this.deadlineSubscription$?.unsubscribe();
  }

}
