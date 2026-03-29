# Angular Precise Timer

A high-performance, reusable Angular component designed for precision countdowns. This component uses **Timestamp Synchronization** to prevent clock drift caused by browser lag or background tab throttling.


<img width="638" height="303" alt="image" src="https://github.com/user-attachments/assets/5e34af30-ce53-457f-83dc-416b376fe846" />
<img width="541" height="327" alt="image" src="https://github.com/user-attachments/assets/31077801-e9b3-4162-b4f2-06062689f385" />
<img width="611" height="326" alt="image" src="https://github.com/user-attachments/assets/ac5afebf-bc1f-467e-bb3c-9ba4e50e7804" />



### Key Features
- **Reactive Accuracy**: Calculates time by subtracting current system time from a fixed deadline.
- **Performance Optimized**: Runs outside of Angular's `NgZone` and uses **Signals** for granular DOM updates.
- **Three-State UI**: Includes built-in Skeleton Loading, Active Ticking (with Warning mode), and "Time's Up" states.
- **Configurable**: Easily adjust durations and warning thresholds via Inputs.

---

### 🛠 How it Works: Reactive Accuracy
Unlike standard `setInterval` counters, this timer uses **Timestamp Synchronization**. 
Even if the browser lags or the tab is backgrounded, the clock stays perfectly synced with the system time.

$$\text{Time Remaining} = \text{Deadline Timestamp} - \text{Current Timestamp}$$

---
### ⚡ Performance Optimizations
- **NgZone.runOutsideAngular**: The 100ms interval runs outside the Angular zone to prevent global change detection churn.
- **Angular Signals**: UI updates are granular; only the time string and progress bar re-render.
- **CSS Animations**: The "Warning" pulse is handled by the GPU, keeping the main thread free.
---

### 🚀 Usage
#### 1. Integration
Import the standalone component into your parent component:

```typescript
import { PreciseTimerComponent } from './components/precise-timer/precise-timer.component';

@Component({
  standalone: true,
  imports: [PreciseTimerComponent],
  // ...
})

<app-precise-timer 
  [durationSeconds]="75"
  [isLoading]="false"
  [warningThresholdSeconds]="30"
  (onTimerFinish)="handleTimeout()">
</app-precise-timer>
```
#### 2. Inputs & Outputs

| Inputs (@Input) | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `[durationSeconds]` | `number` | `0` | Total countdown time in seconds. The timer starts once this is > 0 and `isLoading` is false. |
| `[isLoading]` | `boolean` | `true` | Controls the skeleton loader. Set to `false` once your API data arrives. |
| `[warningThresholdSeconds]` | `number` | `10` | The second mark where the UI turns red and starts pulsing. |

| Outputs (@Output) | Payload | Description |
| :--- | :--- | :--- |
| `(onTimerFinish)` | `void` | Emitted immediately when the countdown reaches `00:00:00`. |

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.19.

## Development server

To start a local development server, run:
---

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
