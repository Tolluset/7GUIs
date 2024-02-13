import { tags, state } from "../lib/base.v2.js";

const { div, input, button } = tags;

export default function Counter() {
  let [count, setCount] = state<number>(0);

  return div(
    { class: "frame-wrapper" },
    div({ class: "frame-title" }, "Counter"),
    div(
      { class: "frame-contents-col" },
      input({ readOnly: true, value: count }),
      button({ onClick: () => setCount((prev) => prev + 1) }, "Counter"),
    ),
  );
}
