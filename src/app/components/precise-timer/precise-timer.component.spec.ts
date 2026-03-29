import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { PreciseTimerComponent } from './precise-timer.component';

describe('PreciseTimerComponent', () => {
  let component: PreciseTimerComponent;
  let fixture: ComponentFixture<PreciseTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreciseTimerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PreciseTimerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Ensure timer is cleaned up
    component.ngOnDestroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have required input durationSeconds', () => {
      component.durationSeconds = 60;
      fixture.detectChanges();
      expect(component.durationSeconds).toBe(60);
    });

    it('should have optional isLoading input with default value false', () => {
      fixture.detectChanges();
      expect(component.isLoading).toBe(false);
    });

    it('should have optional warningThresholdSeconds with default value 10', () => {
      fixture.detectChanges();
      expect(component.warningThresholdSeconds).toBe(10);
    });

    it('should have onTimerFinish output EventEmitter', () => {
      expect(component.onTimerFinish).toBeDefined();
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      component.durationSeconds = 60;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should compute isExpired as false when timer has remaining time and not loading', () => {
      expect(component.isExpired()).toBe(false);
    });

    it('should compute isExpired as true when msRemaining <= 0 and not loading', fakeAsync(() => {
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(61000); // Wait for timer to expire
      expect(component.isExpired()).toBe(true);
    }));

    it('should compute isExpired as false when loading', fakeAsync(() => {
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      component.isLoading = true;
      tick(1000);
      expect(component.isExpired()).toBe(false);
    }));

    it('should compute isWarning as true when remaining time is below threshold and not expired', fakeAsync(() => {
      component.durationSeconds = 15;
      component.warningThresholdSeconds = 10;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(5500); // 5.5 seconds elapsed, 9.5 seconds remaining (below threshold)
      expect(component.isWarning()).toBe(true);
    }));

    it('should compute isWarning as false when remaining time is above threshold', fakeAsync(() => {
      component.durationSeconds = 60;
      component.warningThresholdSeconds = 10;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(100); // Only 100ms elapsed
      expect(component.isWarning()).toBe(false);
    }));

    it('should compute isWarning as false when expired', fakeAsync(() => {
      component.durationSeconds = 5;
      component.warningThresholdSeconds = 10;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(6000); // Wait for expiration
      expect(component.isWarning()).toBe(false);
    }));

    it('should compute progress as percentage of remaining time', fakeAsync(() => {
      component.durationSeconds = 100;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(50000); // 50 seconds elapsed (50% of 100s)
      expect(component.progress()).toBeCloseTo(50, 5);
    }));

    it('should compute progress as 100 at the start', fakeAsync(() => {
      component.durationSeconds = 60;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(100); // Small tick to ensure timer has started
      expect(component.progress()).toBeGreaterThan(99);
    }));

    it('should compute progress as 0 when expired', fakeAsync(() => {
      component.durationSeconds = 5;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(6000);
      expect(component.progress()).toBeLessThanOrEqual(0);
    }));
  });

  describe('Display Time', () => {
    beforeEach(() => {
      component.durationSeconds = 3661; // 1 hour, 1 minute, 1 second
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should display format HH:MM:SS for times >= 1 hour', fakeAsync(() => {
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(100);
      expect(component.displayTime()).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(component.displayTime()).toContain('01:');
    }));

    it('should display format MM:SS for times < 1 hour', fakeAsync(() => {
      component.durationSeconds = 125; // 2 minutes 5 seconds
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(100);
      const time = component.displayTime();
      const parts = time.split(':');
      expect(parts.length).toBe(2);
    }));

    it('should display 00:00 when expired', fakeAsync(() => {
      component.durationSeconds = 5;
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(6000);
      expect(component.displayTime()).toBe('00:00');
    }));

    it('should pad seconds and minutes with leading zeros', fakeAsync(() => {
      component.durationSeconds = 65; // 1 minute 5 seconds
      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      tick(100);
      const time = component.displayTime();
      expect(time).toMatch(/01:0\d/);
    }));
  });

  describe('Timer Lifecycle', () => {
    it('should start countdown when isLoading changes from true to false', fakeAsync(() => {
      component.durationSeconds = 60;
      component.isLoading = true;
      fixture.detectChanges();

      spyOn(component['zone'], 'runOutsideAngular').and.callThrough();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      expect(component['zone'].runOutsideAngular).toHaveBeenCalled();
    }));

    it('should not start countdown if durationSeconds is 0 or negative', () => {
      component.durationSeconds = 0;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component['zone'], 'runOutsideAngular').and.callThrough();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      expect(component['zone'].runOutsideAngular).not.toHaveBeenCalled();
    });

    it('should not start countdown if isLoading changes to true', () => {
      component.durationSeconds = 60;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component['zone'], 'runOutsideAngular').and.callThrough();

      component.ngOnChanges({
        isLoading: new SimpleChange(false, true, true)
      });

      expect(component['zone'].runOutsideAngular).not.toHaveBeenCalled();
    });

    it('should not start countdown if only durationSeconds changes', () => {
      component.durationSeconds = 60;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component['zone'], 'runOutsideAngular').and.callThrough();

      component.ngOnChanges({
        durationSeconds: new SimpleChange(30, 60, true)
      });

      expect(component['zone'].runOutsideAngular).not.toHaveBeenCalled();
    });
  });

  describe('Timer Countdown and Events', () => {
    it('should emit onTimerFinish event when timer expires', fakeAsync(() => {
      component.durationSeconds = 5;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component.onTimerFinish, 'emit');

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(5100); // Wait for timer to expire

      expect(component.onTimerFinish.emit).toHaveBeenCalled();
    }));

    it('should update msRemaining during countdown', fakeAsync(() => {
      component.durationSeconds = 60;
      component.isLoading = false;
      fixture.detectChanges();

      const initialProgress = component.progress();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(30000); // 30 seconds passed

      const updatedProgress = component.progress();

      expect(updatedProgress).toBeLessThan(initialProgress);
    }));

    it('should call zone.run when timer finishes to run change detection', fakeAsync(() => {
      component.durationSeconds = 5;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component['zone'], 'run').and.callThrough();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(5100);

      expect(component['zone'].run).toHaveBeenCalled();
    }));

    it('should update display time as countdown progresses', fakeAsync(() => {
      component.durationSeconds = 120; // 2 minutes
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      const initialTime = component.displayTime();
      tick(31000); // 31 seconds passed
      const updatedTime = component.displayTime();

      expect(updatedTime).not.toBe(initialTime);
    }));
  });

  describe('Timer Cleanup', () => {
    it('should clear interval on ngOnDestroy', () => {
      component.durationSeconds = 60;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      spyOn(window, 'clearInterval');

      component.ngOnDestroy();

      expect(window.clearInterval).toHaveBeenCalled();
    });

    it('should not throw error if ngOnDestroy is called without active timer', () => {
      expect(() => {
        component.ngOnDestroy();
      }).not.toThrow();
    });

    it('should clear interval when timer reaches zero', fakeAsync(() => {
      component.durationSeconds = 3;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      spyOn(window, 'clearInterval');
      tick(3500);

      expect(window.clearInterval).toHaveBeenCalled();
    }));
  });

  describe('Edge Cases', () => {
    it('should handle very small durations (1 second)', fakeAsync(() => {
      component.durationSeconds = 1;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component.onTimerFinish, 'emit');

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(1100);

      expect(component.onTimerFinish.emit).toHaveBeenCalled();
      expect(component.isExpired()).toBe(true);
    }));

    it('should handle very large durations (hours)', fakeAsync(() => {
      component.durationSeconds = 3600; // 1 hour
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(100);

      expect(component.displayTime()).toContain('01:00:00');
      expect(component.isExpired()).toBe(false);
    }));

    it('should handle warning threshold equal to duration', fakeAsync(() => {
      component.durationSeconds = 10;
      component.warningThresholdSeconds = 10;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(100);

      expect(component.isWarning()).toBe(true);
    }));

    it('should handle warning threshold of 0', fakeAsync(() => {
      component.durationSeconds = 10;
      component.warningThresholdSeconds = 0;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(100);

      expect(component.isWarning()).toBe(false);
    }));

    it('should handle negative remaining time gracefully', fakeAsync(() => {
      component.durationSeconds = 3;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      tick(5000); // Wait well past expiration

      expect(component.progress()).toBeLessThanOrEqual(0);
      expect(component.isExpired()).toBe(true);
    }));
  });

  describe('State Transitions', () => {
    it('should transition from loading to counting down', fakeAsync(() => {
      component.durationSeconds = 30;
      component.isLoading = true;
      fixture.detectChanges();

      expect(component.isLoading).toBe(true);

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });
      component.isLoading = false;

      tick(100);

      expect(component.isLoading).toBe(false);
      expect(component.isExpired()).toBe(false);
    }));

    it('should transition from counting down to expired', fakeAsync(() => {
      component.durationSeconds = 5;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      expect(component.isExpired()).toBe(false);

      tick(5100);

      expect(component.isExpired()).toBe(true);
    }));

    it('should transition from counting down to warning', fakeAsync(() => {
      component.durationSeconds = 60;
      component.warningThresholdSeconds = 20;
      component.isLoading = false;
      fixture.detectChanges();

      component.ngOnChanges({
        isLoading: new SimpleChange(true, false, true)
      });

      expect(component.isWarning()).toBe(false);

      tick(41000); // 41 seconds elapsed, 19 seconds remaining (below 20s threshold)

      expect(component.isWarning()).toBe(true);
      expect(component.isExpired()).toBe(false);
    }));
  });
});
