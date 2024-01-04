interface States {
  celsius: number;
  fahrenheit: number;
}

export class TemperatureConverter {
  private element: Element;
  private layout: Element;

  private states: States = {
    celsius: 0,
    fahrenheit: 0,
  };

  constructor(element: Element) {
    this.element = element;

    this.layout = document.createElement("div");
    this.element.appendChild(this.layout);

    this.states = this.setup();
    this.mount();
  }

  private setup() {
    const handler: ProxyHandler<States> = {
      set: (target, prop, value) => {
        Reflect.set(target, prop, value);

        this.render();

        return true;
      },
    };

    const proxy = new Proxy<States>(this.states, handler);
    return proxy;
  }

  private fahrenheitToCelsius(fah: number) {
    return (fah - 32) * (5 / 9);
  }

  private celsiusToFahrenheit(cel: number) {
    return cel * (9 / 5) + 32;
  }

  private handleCelsiusInputTyped(e: InputEvent) {
    if (e.currentTarget instanceof HTMLInputElement) {
      this.states.celsius = Number(e.currentTarget.value);
      this.states.fahrenheit = this.celsiusToFahrenheit(
        Number(e.currentTarget.value),
      );
    }
  }

  private handleFahrenheitInputTyped(e: InputEvent) {
    if (e.currentTarget instanceof HTMLInputElement) {
      this.states.fahrenheit = Number(e.currentTarget.value);
      this.states.celsius = this.fahrenheitToCelsius(
        Number(e.currentTarget.value),
      );
    }
  }

  private template() {
    const _template = document.createElement("template");

    _template.innerHTML = `
      <div class="temp-conv-wrapper">
        <div class="temp-conv-title">TempConv</div>
        <div class="temp-conv-contents">
          <input id="celsius" type="number" class="temp-conv-celsius"></input>
          <div>Celsisus</div>
          <div>=</div>
          <input id="fahrenheit" type="number" class="temp-conv-fahrenheit"></input>
          <div>Fahrenheit</div>
        </div>
      </div>
    `;

    return _template;
  }

  private mount() {
    const template = this.template().content;
    const celsius =
      template.querySelector<HTMLInputElement>(".temp-conv-celsius");
    const fahrenheit = template.querySelector<HTMLInputElement>(
      ".temp-conv-fahrenheit",
    );

    celsius.addEventListener("input", this.handleCelsiusInputTyped.bind(this));
    fahrenheit.addEventListener(
      "input",
      this.handleFahrenheitInputTyped.bind(this),
    );

    this.layout.replaceChildren(template);
  }

  private render() {
    this.layout.querySelector<HTMLInputElement>(".temp-conv-celsius").value =
      this.states.celsius.toString();
    this.layout.querySelector<HTMLInputElement>(".temp-conv-fahrenheit").value =
      this.states.fahrenheit.toString();
  }
}
