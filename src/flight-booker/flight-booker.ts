import { Base } from "../lib/base.js";

type SelectedOption = "one-way-flight" | "return-flight";

interface State {
  selectedOption: SelectedOption;
  startDate: number;
  retunDate: number;
}

const state: State = {
  selectedOption: "one-way-flight",
  startDate: today(),
  retunDate: today(),
};

export class FlightBooker extends Base<State> {
  constructor(element: Element) {
    super(element, state);
  }

  private handleSelectChange(e: Event) {
    if (e.currentTarget instanceof HTMLSelectElement) {
      this.state.selectedOption = e.currentTarget.value as SelectedOption;
    }
  }

  private handleInputChange(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      const id = e.target.id;

      const time = new Date(e.target.value).getTime();

      if (id === "startDate") {
        this.state.startDate = time;
        return;
      }

      if (id === "returnDate") {
        this.state.retunDate = time;
        return;
      }
    }
  }

  private handleButtonClick() {
    alert(
      `You have booked "${this.state.selectedOption}" on ${dateFormat(
        this.state.startDate,
      )} ${
        this.state.selectedOption === "return-flight"
          ? "~ " + dateFormat(this.state.retunDate)
          : ""
      }`,
    );
  }

  private isValidFlightDate() {
    return this.state.startDate < this.state.retunDate;
  }

  protected template() {
    const t = document.createElement("template");

    t.innerHTML = `
      <div class="flight-booker-wrapper">
        <div class="flight-booker-title">Book Flight</div>
        <div class="flight-booker-contents">
          <select id="flight-booker-select">
            <option value="one-way-flight" ${
              this.state.selectedOption === "one-way-flight" ? "selected" : ""
            }>one-way flight</option>
            <option value="return-flight" ${
              this.state.selectedOption === "return-flight" ? "selected" : ""
            }>return flight</option>
          </select>
          <input id="startDate" class="flight-booker-input-start-date" type="date" value=${dateFormat(
            this.state.startDate,
          )}  />
          <input id="returnDate" class="flight-booker-input-return-date" type="date" value=${dateFormat(
            this.state.retunDate,
          )} ${
            this.state.selectedOption !== "return-flight"
              ? "disabled"
              : !this.isValidFlightDate()
              ? "disabled"
              : ""
          } />
          <button ${
            this.state.selectedOption === "return-flight" &&
            !this.isValidFlightDate()
              ? "disabled"
              : ""
          }>Book</button>
        </div>
      </div>
    `;

    return t.content;
  }

  protected events() {
    const t = this.template();

    const select = t.querySelector("select");

    const startDate = t.querySelector(".flight-booker-input-start-date");
    const returnDate = t.querySelector(".flight-booker-input-return-date");

    const button = t.querySelector("button");

    select.addEventListener("change", this.handleSelectChange.bind(this));

    startDate.addEventListener("change", this.handleInputChange.bind(this));
    returnDate.addEventListener("change", this.handleInputChange.bind(this));

    button.addEventListener("click", this.handleButtonClick.bind(this));
    return t;
  }
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
