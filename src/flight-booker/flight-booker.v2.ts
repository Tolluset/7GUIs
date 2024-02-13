import { tags, state } from "../lib/base.v2.js";

const { div, input, button, select, option } = tags;

type SelectedOption = "one-way-flight" | "return-flight";

export default function Counter() {
  const [selectedOption, setSelectedOption] =
    state<SelectedOption>("one-way-flight");
  const [startDate, setStartDate] = state(dateFormat(today()));
  const [returnDate, setReturnDate] = state(dateFormat(today()));

  function handleSelectChange(e: Event) {
    console.debug("🚀 : flight-booker.v2.ts:13: e=", e);
    if (e.currentTarget instanceof HTMLSelectElement) {
      console.log("env");
      setSelectedOption(e.currentTarget.value as SelectedOption);
      console.debug(
        "🚀 : flight-booker.v2.ts:8: selectedOption=",
        selectedOption,
      );
    }
  }

  return div(
    { class: "frame-wrapper" },
    div({ class: "frame-title" }, "Book Flight"),
    div(
      { class: "frame-contents-row" },
      select(
        { onChange: handleSelectChange },

        option({ value: "one-way-flight" }, "one-way-flight"),
        option({ value: "return-flight" }, "return-flight"),
      ),
      input({ type: "date", value: startDate }),
      input({ type: "date", value: returnDate }),
      button(
        {
          disabled: selectedOption.value === "return-flight",
          onClick: () => 1,
        },
        "Book",
      ),
    ),
  );
}

function today() {
  const now = new Date();

  return now.getTime();
}

function dateFormat(time: number) {
  const now = new Date(time);
  const year = now.getFullYear();
  const month = (now.getMonth() + 1 < 10 ? "0" : "") + (now.getMonth() + 1);
  const day = (now.getDate() < 10 ? "0" : "") + now.getDate();

  return `${year}-${month}-${day}`;
}
