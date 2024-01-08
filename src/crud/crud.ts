import { Base } from "../lib/base.js";

/**
 * @TODO: Tasks
 * [ ] At most one entry can be selected in L(listbox) at a time
 * [ ] Can filter surname by filter prefix input
 *    [ ] filtered on input change
 * [ ] Button update and delete is enabled when L is selected
 * [ ] Create item when click Button(create) with Text(name) Text(surname)
 * [ ] Button update should update selected item
 * [ ] Button delete should delete selected item
 */

const MAX_TIME = 30;

interface State {
  name: string;
  surname: string;
  nameList: string[];
  prefix: string;
}

const state: State = {
  name: "",
  surname: "",
  nameList: [],
  prefix: "",
};

export class CRUD extends Base<State> {
  constructor(element: Element) {
    super(element, state);

    // this.startTimer();
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
        <div class="frame-title">CRUD</div>
        <div class="frame-contents-row">
          <div>
            <span>Filter prefix: </span>
            <input />
          </div>
          <div class="flex">
            <div>
              <label>
                <select id="fruit" name="fruit" multiple>
                  <option value="apple">사과</option>
                  <option value="orange">오렌지</option>
                  <option value="banana">바나나</option>
                  <option value="grape">포도</option>
                </select>
              </label>
            </div>
            <div>
              <div >
                <label>
                  <input  max=${MAX_TIME} value=${this.state.duration} />
                </label>
              </div>
              <div>
                <label>
                  <input  max=${MAX_TIME} value=${this.state.duration} />
                </label>
              </div>
            </div>
          </div>
          <div>
            <button>Create</button>
            <button>Update</button>
            <button>Delete</button>
          </div>
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
