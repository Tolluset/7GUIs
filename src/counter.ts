export class Counter {
  private element: Element;
  private layout: Element;

  private count: number;

  constructor(element: Element) {
    this.element = element;
    this.count = 0;

    this.layout = document.createElement("div");
    this.element.appendChild(this.layout);

    this.render();
  }

  private increase() {
    this.count++;

    this.render();
  }

  private template() {
    const _template = document.createElement("template");

    _template.innerHTML = `
      <div class="counter-wrapper">
        <div class="counter-title">Counter</div>
        <div class="counter-contents">
          <input id="counter" readOnly="true" value=${this.count} class="counter-input"></input>
          <button type="button" class="counter-button">Count</button>
        </div>
      </div>
  `;

    return _template;
  }

  private render() {
    const template = this.template().content;

    const input = template.querySelector<HTMLInputElement>(".counter-input");
    input.value = this.count.toString();

    const button = template.querySelector<HTMLButtonElement>(".counter-button");
    button.addEventListener("click", this.increase.bind(this));

    this.layout.replaceChildren(template);
  }
}
