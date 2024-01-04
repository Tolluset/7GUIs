import { Base } from "../lib/base.js";

interface State {
  celsius: number | undefined;
  fahrenheit: number | undefined;
}

const state: State = {
  celsius: undefined,
  fahrenheit: undefined,
};

export class TemperatureConverter extends Base<State> {
  constructor(element: Element) {
    super(element, state);
  }

  private fahrenheitToCelsius(fah: number) {
    return (fah - 32) * (5 / 9);
  }

  private celsiusToFahrenheit(cel: number) {
    return cel * (9 / 5) + 32;
  }

  private handleCelsiusInputTyped(e: InputEvent) {
    if (e.currentTarget instanceof HTMLInputElement) {
      this.state.celsius = Number(e.currentTarget.value);
      this.state.fahrenheit = this.celsiusToFahrenheit(
        Number(e.currentTarget.value),
      );
    }
  }

  private handleFahrenheitInputTyped(e: InputEvent) {
    if (e.currentTarget instanceof HTMLInputElement) {
      this.state.fahrenheit = Number(e.currentTarget.value);
      this.state.celsius = this.fahrenheitToCelsius(
        Number(e.currentTarget.value),
      );
    }
  }

  protected template() {
    const _template = document.createElement("template");

    _template.innerHTML = `
      <div class="temp-conv-wrapper">
        <div class="temp-conv-title">TempConv</div>
        <div class="temp-conv-contents">
          <input id="celsius" type="number" value=${state.celsius} class="temp-conv-celsius"></input>
          <div>Celsisus</div>
          <div>=</div>
          <input id="fahrenheit" type="number" value=${state.fahrenheit} class="temp-conv-fahrenheit"></input>
          <div>Fahrenheit</div>
        </div>
      </div>
    `;

    return _template.content;
  }

  protected events() {
    const t = this.template();

    const celsius = t.querySelector<HTMLInputElement>(".temp-conv-celsius");
    const fahrenheit = t.querySelector<HTMLInputElement>(
      ".temp-conv-fahrenheit",
    );

    celsius.addEventListener("input", this.handleCelsiusInputTyped.bind(this));
    fahrenheit.addEventListener(
      "input",
      this.handleFahrenheitInputTyped.bind(this),
    );

    return t;
  }
}
