export abstract class Base<T extends Object> {
  private element: Element;
  protected layout: Element;

  protected state: T = {} as T;
  private prevState: T = {} as T;

  private focusedElement: Element;

  constructor(element: Element, state: T) {
    this.element = element;
    this.layout = document.createElement("div");

    this.state = this.setup(state);
    this.prevState = copy(this.state);

    this.element.appendChild(this.layout);
    this.mount(this.events());
  }

  protected abstract template(): DocumentFragment;

  protected abstract events(): DocumentFragment;

  private setup(state: T) {
    const handler: ProxyHandler<T> = {
      set: (target, prop, value) => {
        const diffs = diff(this.prevState, this.state);

        Reflect.set(target, prop, value);

        if (diffs.length === 0 || diffs.includes(prop.toString())) {
          this.render();
          this.prevState = {} as T;
        }

        return true;
      },
    };

    const proxy = new Proxy<T>(state, handler);
    return proxy;
  }

  private mount(t: DocumentFragment) {
    this.layout.replaceChildren(t);
  }

  private render() {
    const focused = document.activeElement;

    this.mount(this.events());
    this.restoreFocus(focused);
  }

  private restoreFocus(focused: Element) {
    if (!focused.id) {
      return;
    }

    const next = document.querySelector(`#${focused.id}`);
    if (next) {
      focusing(next);
      this.focusedElement = next;

      return;
    }

    const prev = document.querySelector(`#${this.focusedElement.id}`);
    if (prev) {
      focusing(prev);

      return;
    }
  }
}

function diff(obj1: any, obj2: any) {
  const diffs = [];

  for (const key in obj1) {
    if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
      if (obj1[key] !== obj2[key]) {
        diffs.push(key);
      }
    } else {
      diffs.push(key);
    }
  }

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      diffs.push(key);
    }
  }

  return diffs;
}

function copy(obj: unknown) {
  return JSON.parse(JSON.stringify(obj));
}

function focusing(element: Element) {
  if (isFocusable(element)) {
    element.focus();

    if (element instanceof HTMLInputElement) {
      const prevType = element.type;

      element.type = "text";
      element.setSelectionRange(element.value.length, element.value.length);
      element.type = prevType;
    }
  }
}

function isFocusable(element: Element): element is HTMLElement {
  return element instanceof HTMLElement && typeof element.focus === "function";
}
