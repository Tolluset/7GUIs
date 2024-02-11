let stateId = 1;
const listeners: { tag: HTMLElement; props: unknown }[] = [];

function tag(name: keyof HTMLElementTagNameMap, ...args: unknown[]) {
  const tag = document.createElement(name);
  const [props, ...childrens] = args;

  update(tag, props);

  childrens.forEach((child: Node | String) => {
    if (child instanceof Node) {
      tag.appendChild(child);
    } else if (typeof child === "string") {
      tag.textContent = child;
    }
  });

  return tag;
}

function update(tag: HTMLElement, props: unknown) {
  for (let [k, v] of Object.entries(props ?? {})) {
    eventer(tag, k, v);
    renewal(tag, k, v);
    observing(tag, k, v);
  }
}

function eventer(tag: HTMLElement, k: string, v: any) {
  if (k.startsWith("on")) {
    const evt = k.slice(2).toLowerCase();

    tag.removeEventListener(evt, v);
    tag.addEventListener(evt, v);

    return;
  }
}

function renewal(tag: HTMLElement, k: string, v: any) {
  tag.setAttribute(k, v);
  return;
}

function observing(tag: HTMLElement, k: string, v: any) {
  if (v.__proto__.stateId && !v.__proto__.added) {
    v.__proto__.added = true;

    listeners.push({ tag, props: { [k]: v } });
  }
}

type Tags = Partial<{
  [K in keyof HTMLElementTagNameMap]: (...args: unknown[]) => HTMLElement;
}>;

const tags: Tags = new Proxy(
  {},
  {
    get(_: unknown, propKey: keyof HTMLElementTagNameMap) {
      return (...args: unknown[]) => tag(propKey, ...args);
    },
  },
);

function state<T>(initVal: T): [T, (newVal: T | ((prev: T) => T)) => void] {
  let value: T = initVal;

  // @ts-expect-error use prorto
  value.__proto__.stateId = ++stateId;

  const setValue = (_newValue: T | ((prev: T) => T)) => {
    const newValue =
      typeof _newValue === "function"
        ? (_newValue as (prev: T) => T)(value)
        : _newValue;

    value = newValue;

    listeners.forEach((listener) => {
      for (let [k, v] of Object.entries(listener.props)) {
        // @ts-expect-error use prorto
        if (v.__proto__.stateId === value.__proto__.stateId) {
          // @ts-expect-error value will be updated
          listener.props[k] = newValue;
        }
      }

      update(listener.tag, listener.props);
    });
  };

  return [value, setValue];
}

export { tags, state };
