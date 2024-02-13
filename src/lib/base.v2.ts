let stateId = 1;

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
  if (v?._id) {
    tag.setAttribute(k, v.value);
    return;
  }

  console.debug("🚀 : base.v2.ts:45: v=", k, v);
  if (k === "disabled" && v === false) {
    tag.removeAttribute(k);
    return;
  }

  tag.setAttribute(k, v);

  return;
}

function observing(tag: HTMLElement, k: string, v: any) {
  if (
    v._listeners?.find(
      (listener: { props: { value: { _id: number } } }) =>
        listener.props.value._id === v._id,
    )
  ) {
    return;
  }

  v._listeners?.push({ tag, props: { [k]: v } });
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

function state<T>(
  initVal: T,
): [{ value: T }, (newVal: T | ((prev: T) => T)) => void] {
  let _value = {
    __proto__: {
      get value() {
        return this._value;
      },

      set value(v) {
        this._value = v;
      },
    },
    _id: ++stateId,
    _listeners: [] as unknown[],
    _value: initVal,
  };

  const setValue = (_newValue: T | ((prev: T) => T)) => {
    const newValue =
      typeof _newValue === "function"
        ? (_newValue as (prev: T) => T)(_value.value)
        : _newValue;

    _value._listeners.forEach((listener) => {
      for (let [_, v] of Object.entries(listener.props)) {
        if (v._id === _value._id) {
          _value.value = newValue;
        }
      }

      update(listener.tag, listener.props);
    });
  };
  return [_value, setValue];
}

export { tags, state };
