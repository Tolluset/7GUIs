import { Base } from "../lib/base.js";

/**
 * @TODO: Tasks
 * [x] At most one entry can be selected in L(listbox) at a time
 * [x] Can filter surname by filter prefix input
 *    [x] filtered on input change
 * [x] Button update and delete is enabled when L is selected
 * [x] Create item when click Button(create) with Text(name) Text(surname)
 * [x] Button update should update selected item
 * [x] Button delete should delete selected item
 * [x] Perfect design
 */

const PREFIX = "crud";

const SELECT = {
  nameList: `${PREFIX}-select-name-list`,
};

const LABEL = {
  name: `${PREFIX}-label-name`,
  surname: `${PREFIX}-label-surname`,
};

const INPUT = {
  prefix: `${PREFIX}-input-prefix`,
  name: `${PREFIX}-input-name`,
  surname: `${PREFIX}-input-surname`,
};

const BUTTON = {
  create: `${PREFIX}-button-create`,
  update: `${PREFIX}-button-update`,
  delete: `${PREFIX}-button-delete`,
};

type Name = {
  name: string;
  surname: string;
};

type NameListItem = Name & { selected: boolean };

interface State {
  name: Name["name"];
  surname: Name["surname"];
  nameList: NameListItem[];
  prefix: Name["surname"];
}

const state: State = {
  name: "",
  surname: "",
  nameList: [
    { name: "Emil", surname: "Hans", selected: false },
    { name: "Mustermann", surname: "Max", selected: false },
    { name: "Tisch", surname: "Roman", selected: false },
  ],
  prefix: "",
};

export class CRUD extends Base<State> {
  constructor(element: Element) {
    super(element, state);
  }

  private handleInputInput(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      switch (e.target.id) {
        case INPUT.prefix:
          this.state.prefix = e.target.value;
          return;
        case INPUT.name:
          this.state.name = e.target.value;
          return;
        case INPUT.surname:
          this.state.surname = e.target.value;
          return;
      }
    }
  }

  private handleButtonClick(e: Event) {
    if (e.target instanceof HTMLButtonElement) {
      switch (e.target.className) {
        case BUTTON.create: {
          if (this.state.name === "" && this.state.surname === "") {
            return;
          }

          this.state.nameList.push({
            name: this.state.name,
            surname: this.state.surname,
            selected: false,
          });

          return;
        }

        case BUTTON.update: {
          if (this.state.name === "" && this.state.surname === "") {
            return;
          }

          const index = this.state.nameList.findIndex((item) => item.selected);

          if (index !== -1) {
            const updatedItems = [...this.state.nameList];

            updatedItems[index] = {
              name: this.state.name,
              surname: this.state.surname,
              selected: true,
            };

            this.state.nameList = updatedItems;
          }

          return;
        }

        case BUTTON.delete: {
          const updatedItems = [...this.state.nameList];

          this.state.nameList = updatedItems.filter((item) => !item.selected);

          return;
        }
      }
    }
  }

  private handleSelectInput(e: Event) {
    const update = (
      arr: NameListItem[],
      name: Name["name"],
      surname: Name["surname"],
    ) => {
      const index = arr.findIndex(
        (item) => item.name === name && item.surname && surname,
      );

      if (index !== -1) {
        const updatedItems = this.state.nameList.map((item) => ({
          ...item,
          selected: false,
        }));
        updatedItems[index] = { name, surname, selected: true };

        return updatedItems;
      }

      return arr;
    };

    if (e.target instanceof HTMLSelectElement) {
      const { value } = e.target;

      const [name, surname] = value.split(", ");

      this.state.nameList = update(this.state.nameList, name, surname);
    }
  }

  protected template() {
    const t = document.createElement("template");

    t.innerHTML = `
      <div class="frame-wrapper">
        <div class="frame-title">CRUD</div>
        <div class="frame-contents-row gap-12">
          <div class="${INPUT.prefix}-wrapper">
            <span>Filter prefix: </span>
            <input id="${INPUT.prefix}" value="${this.state.prefix}" />
          </div>
          <div class="${SELECT.nameList}-wrapper">
            <div>
              <label>
                <select id="${SELECT.nameList}" multiple>
                  ${this.state.nameList.map((item, index) => {
                    return `<option id="option-${index}" ${
                      this.state.nameList.findIndex((item) => item.selected) ===
                      index
                        ? "selected"
                        : this.state.prefix &&
                          item.surname.startsWith(this.state.prefix)
                        ? "selected"
                        : undefined
                    }>${item.name}, ${item.surname}</option>`;
                  })}
                </select>
              </label>
            </div>
            <div>
              <div>
                <label class="${LABEL.name}">
                  <span>Name: </span>
                  <input id="${INPUT.name}" value="${this.state.name}" />
                </label>
              </div>
              <div>
                <label class="${LABEL.surname}"}>
                  Surname: 
                  <input id="${
                    INPUT.surname
                  }" class="crud-input-surname" value="${this.state.surname}" />
                </label>
              </div>
            </div>
          </div>
          <div>
            <button class=${BUTTON.create}>Create</button>
            <button class=${BUTTON.update}>Update</button>
            <button class=${BUTTON.delete}>Delete</button>
          </div>
        </div>
      </div>
    `;

    return t.content;
  }

  protected events() {
    const t = this.template();

    const prefixInput = t.querySelector(`#${INPUT.prefix}`);
    const nameInput = t.querySelector(`#${INPUT.name}`);
    const surnameInput = t.querySelector(`#${INPUT.surname}`);

    const createButton = t.querySelector(`.${BUTTON.create}`);
    const updateButton = t.querySelector(`.${BUTTON.update}`);
    const deleteButton = t.querySelector(`.${BUTTON.delete}`);

    const select = t.querySelector("select");

    prefixInput.addEventListener("input", this.handleInputInput.bind(this));
    nameInput.addEventListener("input", this.handleInputInput.bind(this));
    surnameInput.addEventListener("input", this.handleInputInput.bind(this));

    createButton.addEventListener("click", this.handleButtonClick.bind(this));
    updateButton.addEventListener("click", this.handleButtonClick.bind(this));
    deleteButton.addEventListener("click", this.handleButtonClick.bind(this));

    select.addEventListener("input", this.handleSelectInput.bind(this));

    return t;
  }
}
