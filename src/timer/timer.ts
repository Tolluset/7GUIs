import { Base } from "../lib/base.js";

/**
 * @TODO: Tasks
 * [x] Modify duration when adjust slider
 *   [ ] partial re-render: make drag natural
 * [x] If elapsedTime >= duration than timer stop (guage will be full)
 * [x] If elapsedTime < duration than timer restart (until e >= d)
 * [x] Reset button reset time
 *   [ ] partial re-render: re-render is too fase so click reset button multiple time is neeeded
 */

const MAX_TIME = 30;

interface State {
  elapsedTime: number;
  duration: number;
  timerId: number;
  timerStopped: boolean;
}

const state: State = {
  elapsedTime: MAX_TIME,
  duration: 0,
  timerId: 0,
  timerStopped: false,
};

export class Timer extends Base<State> {
  constructor(element: Element) {
    super(element, state);

    this.startTimer();
  }

  private handleInputInput(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      const value = e.target.value;

      this.state.duration = +value;

      if (this.state.elapsedTime >= this.state.duration) {
        clearInterval(this.state.timerId);
        this.state.timerStopped = true;
        return;
      }

      if (this.state.elapsedTime < this.state.duration) {
        this.state.timerStopped = false;
        this.startTimer();
      }
    }
  }

  private handleButtonClick() {
    this.state.timerStopped = false;
    this.state.elapsedTime = 0;
  }

  private startTimer() {
    this.stopTimer();

    this.state.timerId = setInterval(() => {
      this.state.elapsedTime = +(this.state.elapsedTime - 0.1);

      if (this.state.elapsedTime <= 0.1) {
        this.state.elapsedTime = 0;
      }
    }, 100);
  }

  private stopTimer() {
    clearInterval(this.state.timerId);
  }

  protected template() {
    const t = document.createElement("template");

    t.innerHTML = `
      <div class="frame-wrapper">
        <div class="frame-title">Timer</div>
        <div class="frame-contents-row">
          <div>
            <span>Elapsed Time: </span>
            <progress value=${
              this.state.timerStopped ? MAX_TIME : this.state.elapsedTime
            } max=${MAX_TIME}>gauge</progress>
          </div>
          <span>${this.state.elapsedTime.toFixed(1)}s</span>
          <div>
            <span>Duration: </span>
            <input type="range" max=${MAX_TIME} value=${this.state.duration} />
          </div>
          <button>Reset</button>
        </div>
      </div>
    `;

    return t.content;
  }

  protected events() {
    const t = this.template();

    const input = t.querySelector("input");
    const button = t.querySelector("button");

    input.addEventListener("input", this.handleInputInput.bind(this));
    button.addEventListener("click", this.handleButtonClick.bind(this));

    return t;
  }
}
