import { Base } from "../lib/base.js";

/**
 * @TODO: Tasks
 * [x] can scroll spreadsheet
 * [x] row number 0~99 / column a~z
 * [x] can change specifi cells
 * [x] can click cell when dblclick not click
 * [x] evaluaete cells after change finished
 *    [x] evalueate only depends other cells, not all cells
 *        e.g.) Sum of B1:C4 =
 */

const PREFIX = "cells";

const MAX_ROWS = 99;
const EVALUATE_SIGN = "=";
const EVALUATE_TYPE = ["sum", "minus", "divide", "multiple"] as const;
type EvaluateType = (typeof EVALUATE_TYPE)[number];
const EVALUATE_TARGET = 2;

interface State {
  cells: {
    [atoz: string]: {
      [numbers: string]: string;
    };
  };
}

const state: State = {
  cells: {},
};

export class Cells extends Base<State> {
  constructor(element: Element) {
    super(element, state);
  }

  private handleInputMousedown(e: MouseEvent) {
    if (e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  }

  private handleInputDoubleClick(e: MouseEvent) {
    if (e.target instanceof HTMLInputElement) {
      e.target.focus();
    }
  }

  private handleInputInput(e: InputEvent) {
    if (e.target instanceof HTMLInputElement) {
      const { id, value } = e.target;
      const [col, row] = id.split("-");
      const prev = { ...this.state.cells };

      this.state.cells = { ...prev, [col]: { ...prev[col], [row]: value } };
    }

    findValue(this.state.cells).forEach((cell) => {
      const [col, row] = [cell["atoz"], cell["numbers"]];
      const parsed = this.state.cells[col]?.[row]
        .split(" ")
        .filter((v) => v !== "");
      const type = parsed[0].toLowerCase() as EvaluateType;
      const sign = parsed.slice(-1)[0];
      const willEvaluate =
        sign === EVALUATE_SIGN && EVALUATE_TYPE.includes(type);
      const prev = { ...this.state.cells };

      if (willEvaluate) {
        const targets = parsed[EVALUATE_TARGET].split(":");
        const [t1, t2] = targets;
        const [t1col, t1row, t2col, t2row] = [
          t1[0].toLowerCase(),
          t1.slice(1)[0],
          t2[0].toLowerCase(),
          t2.slice(1)[0],
        ];

        const t1v = +this.state.cells[t1col]?.[t1row];
        const t2v = +this.state.cells[t2col]?.[t2row];

        if (
          typeof t1v === "number" &&
          !isNaN(t1v) &&
          typeof t2v === "number" &&
          !isNaN(t2v)
        ) {
          this.state.cells = {
            ...prev,
            [col]: {
              ...prev[col],
              [row]: handleType(type, t1v, t2v).toString(),
            },
          };
        }
      }
    });
  }

  protected template() {
    const t = document.createElement("template");

    const [alphabets, numbers] = generateAlphabetAndNumbers();

    t.innerHTML = `
      <div class="frame-wrapper">
        <div class="frame-title">Cells</div>
        <div class="frame-contents-row gap-12 bg-white">
          <div class="${PREFIX}-wrapper">
            <div class="${PREFIX}-rows">
              ${numbers
                .map((number) => {
                  return `<div style="height: 35px;">${number}</div>`;
                })
                .join("")}
            </div>
            <div class="flex">
              ${alphabets
                .map((alphabet) => {
                  return `
                    <div class="grid" style="width: 120px; border-right: 1px solid lightgray;">
                      ${"\b" + alphabet}
                      ${numbers
                        .map((number) => {
                          const cells = this.state.cells;
                          const col = cells[alphabet];
                          const value = (col && col[number]) ?? "";

                          return `
                            <input id="${alphabet}-${number}" value="${value}" 
                                style="width: 115px; height: 30px; border: 1px solid lightgray; border-left: none;" />
                          `;
                        })
                        .join("")}
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
      </div>
    `;

    return t.content;
  }

  protected events() {
    const t = this.template();

    const wrapper = t.querySelector(`.${PREFIX}-wrapper`);

    wrapper.addEventListener("mousedown", this.handleInputMousedown.bind(this));
    wrapper.addEventListener(
      "dblclick",
      this.handleInputDoubleClick.bind(this),
    );
    wrapper.addEventListener("input", this.handleInputInput.bind(this));

    return t;
  }
}

function generateAlphabetAndNumbers() {
  // a~z
  const alphabets = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(97 + i),
  );
  // 0~99
  const numbers = Array.from({ length: MAX_ROWS + 1 }, (_, i) => i.toString());

  return [alphabets, numbers];
}

function findValue(
  cells: State["cells"],
  type: readonly EvaluateType[] = EVALUATE_TYPE,
  sign: string = EVALUATE_SIGN,
): { atoz: string; numbers: string }[] {
  const result: { atoz: string; numbers: string }[] = [];

  for (const atoz in cells) {
    if (cells.hasOwnProperty(atoz)) {
      const numbersObj = cells[atoz];

      const matching = Object.keys(numbersObj).filter((numbers) => {
        const value = numbersObj[numbers].split(" ");
        const [_type, _sign] = [value[0].toLowerCase(), value[3]];

        if (type.includes(_type as EvaluateType) && _sign === sign) {
          return true;
        }
      });

      if (matching.length > 0) {
        result.push(...matching.map((numbers) => ({ atoz, numbers })));
      }
    }
  }

  return result;
}

function handleType(type: EvaluateType, v1: number, v2: number) {
  switch (type) {
    case "sum": {
      return v1 + v2;
    }

    case "minus": {
      return v1 - v2;
    }

    case "divide": {
      return v1 / v2;
    }

    case "multiple": {
      return v1 * v2;
    }
  }
}
