import { Component, inject, OnInit, OnDestroy, NgZone, Input, signal, computed, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-precise-timer',
  imports: [],
  templateUrl: './precise-timer.component.html',
  styleUrl: './precise-timer.component.scss'
})
export class PreciseTimerComponent implements OnInit, OnDestroy {

  private zone = inject(NgZone);

  @Input({ required: true }) durationSeconds!: number;
  @Input() isLoading: boolean = false;
  @Output() onTimerFinish = new EventEmitter<void>();
  @Input() warningThresholdSeconds: number = 10;

  private msRemaining = signal<number>(0);
  private timerId?: number;
  private deadline: number = 0;

  isExpired = computed(() => !this.isLoading && this.msRemaining() <= 0);
  isWarning = computed(() => this.msRemaining() < (this.warningThresholdSeconds * 1000) && !this.isExpired());

  progress = computed(() => {
    const totalMs = this.durationSeconds * 1000;
    return (this.msRemaining() / totalMs) * 100;
  })

  displayTime = computed(() => {
    const totalSeconds = Math.ceil(Math.max(0, this.msRemaining()) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hDisplay = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const mDisplay = minutes.toString().padStart(2, '0');
    const sDisplay = seconds.toString().padStart(2, '0');
    return `${hDisplay}${mDisplay}:${sDisplay}`;
  })

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isLoading']?.currentValue === false && this.durationSeconds > 0) {
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.deadline = Date.now() + this.durationSeconds * 1000;
    this.zone.runOutsideAngular(() => {
      this.timerId = window.setInterval(() => {
        const remaining = this.deadline - Date.now();

        this.msRemaining.set(remaining);

        if (remaining <= 0) {
          this.stopTimer();

          this.zone.run(() => {
            this.onTimerFinish.emit();
          });
        }
      }, 100);
    });
  }

  private stopTimer() {
    if (this.timerId) clearInterval(this.timerId);
  }

  ngOnDestroy() {
    this.stopTimer();
  }


}
