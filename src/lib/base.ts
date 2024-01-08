/**
 * @description limits below
 *
 * - `<input>, <select>` must add `id` attribute
 * - nested array state can't detect for re-render
 * */
export abstract class Base<T extends Object> {
  private element: Element;
  protected layout: Element;

  protected state: T = {} as T;
  private prevState: T = {} as T;
  private wrapped: unknown[];

  private focusedElement: Element;

  constructor(element: Element, state: T) {
    this.element = element;
    this.layout = document.createElement("div");

    this.state = this.setup(state);
    this.prevState = copy(this.state);
    this.wrapped = [];

    this.element.appendChild(this.layout);
    this.mount(this.events());
  }

  protected abstract template(): DocumentFragment;

  protected abstract events(): DocumentFragment;

  private setup(state: T) {
    const handler: ProxyHandler<T> = {
      get: (_target, prop) => {
        const target = _target as Record<string, unknown>;
        const propName = prop.toString();
        const value = target[propName] as unknown;

        // 만약 속성이 배열이라면 배열 메서드를 감지하고 래핑
        if (Array.isArray(value) && !this.wrapped?.includes(propName)) {
          target[propName] = this.wrapArrayMethods(value);
          this.wrapped?.push(propName);
        }

        return value;
      },
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

  private wrapArrayMethods(array: unknown[]): unknown[] {
    const arrayMethods = [
      "push",
      "pop",
      "shift",
      "unshift",
      "splice",
      "sort",
      "reverse",
    ];

    const wrapMethod = (method: string) => {
      // Array 메소드 수정이지만 타입을 위해 number로 캐스트
      let originalMethod = array[method as unknown as number];

      array[method as unknown as number] = (...args: any[]) => {
        // @ts-expect-error originalMethod has callable function
        const result = originalMethod.apply(array, args);

        this.render();
        this.prevState = {} as T;

        return result;
      };
    };

    arrayMethods.forEach(wrapMethod);

    return array;
  }

  private mount(t: DocumentFragment) {
    this.layout.replaceChildren(t);
  }

  private render() {
    const focused = document.activeElement;

    this.mount(this.events());
    this.restoreFocus(focused);

    this.wrapped = [];
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

function diff(obj1: any, obj2: any): string[] {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  return [...keys1, ...keys2].filter((key) => obj1[key] !== obj2[key]);
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
      return;
    }
  }
}

function isFocusable(element: Element): element is HTMLElement {
  return element instanceof HTMLElement && typeof element.focus === "function";
}
