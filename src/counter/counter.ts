import { Base } from "../lib/base.js";

interface State {
  count: number;
}

const state: State = {
  count: 0,
};

export class Counter extends Base<State> {
  constructor(element: Element) {
    super(element, state);
  }

  private increase() {
    this.state.count++;
  }

  protected template() {
    const _template = document.createElement("template");

    _template.innerHTML = `
      <div class="counter-wrapper">
        <div class="counter-title">Counter</div>
        <div class="counter-contents">
          <input id="counter" readOnly="true" value=${this.state.count} class="counter-input"></input>
          <button type="button" class="counter-button">Count</button>
        </div>
      </div>
  `;

    return _template.content;
  }

  protected events() {
    const t = this.template();

    const button = t.querySelector<HTMLButtonElement>(".counter-button");
    button.addEventListener("click", this.increase.bind(this));

    return t;
  }
}
