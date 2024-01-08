import { Base } from "../lib/base.js";

/**
 * @TODO: Tasks
 * [x] left click canvas makes circle
 * [x] left click exist circle make circle fill with gray
 * [x] right click exist circle, pop-up diameter adjust dialog
 *    [x] dialog can adjust diameter with slider, affect immediately
 * [x] can undo tasks, like make circle, adjust diameter etc...
 * [x] redo can redo the undo tasks
 */

const PREFIX = "circle-drawer";

const BUTTON = {
  undo: `${PREFIX}-button-undo`,
  redo: `${PREFIX}-button-redo`,
};

const INPUT = {
  diameter: `${PREFIX}-input-diameter`,
};

const DEFAULT_FILL = "white";
const SELECTED_FILL = "gray";
const DEFAULT_DIAMETER = 30;
const CONTEXT_ID = "2d";

interface Out {
  ctx: CanvasRenderingContext2D;
  dialogPortal: HTMLDivElement;
  dialogRef: HTMLDialogElement;
}

const out: Out = {
  ctx: undefined,
  dialogPortal: document.querySelector("#dialog-portal"),
  dialogRef: undefined,
};

type Circle = {
  x: number;
  y: number;
  fill: string;
  diameter: number;
  selected: boolean;
};

interface State {
  circles: Circle[];
  undos: Circle[];
  redos: Circle[];
  historyCursor: number;
  diameter: number;
  dialogOpen: boolean;
}

const state: State = {
  circles: [],
  undos: [],
  redos: [],
  historyCursor: 0,
  diameter: DEFAULT_DIAMETER,
  dialogOpen: false,
};

// @TODO: this component messed up with duplicated logic should refactor it
export class CircleDrawer extends Base<State> {
  constructor(element: Element) {
    super(element, state);

    this.portal();
  }

  /**
   * @description
   *  undo 는 바뀌기전의 값
   *  redo 는 바뀐 후의 값
   *  cursor = undos.length - counter;
   *  cursor ?> undo() => -1 : redo() : +1
   * */
  private handleButtonClick(e: MouseEvent) {
    if (e.target instanceof HTMLButtonElement) {
      switch (e.target.className) {
        case BUTTON.undo: {
          const undoItem = this.state.undos[this.state.historyCursor];

          const updated = [...this.state.circles];
          const selectedIndex = this.state.circles.findIndex((circle) => {
            return circle.x === undoItem.x && circle.y === undoItem.y;
          });

          if (selectedIndex !== -1 && this.state.historyCursor !== -1) {
            const original = updated[selectedIndex];
            updated[selectedIndex] = {
              ...original,
              diameter: undoItem.diameter,
            };

            this.state.circles = updated;
            this.state.historyCursor !== 0 &&
              (this.state.historyCursor = this.state.historyCursor - 1);

            return;
          }
        }

        case BUTTON.redo: {
          const redoItem = this.state.redos[this.state.historyCursor];

          const updated = [...this.state.circles];
          const selectedIndex = this.state.circles.findIndex((circle) => {
            return circle.x === redoItem.x && circle.y === redoItem.y;
          });

          if (selectedIndex !== -1 && this.state.historyCursor !== -1) {
            const original = updated[selectedIndex];
            updated[selectedIndex] = {
              ...original,
              diameter: redoItem.diameter,
            };

            this.state.circles = updated;
            !(this.state.historyCursor + 1 >= this.state.redos.length) &&
              (this.state.historyCursor = this.state.historyCursor + 1);

            return;
          }
        }
      }
    }
  }

  private handleCanvasClick(e: MouseEvent) {
    if (e.target instanceof HTMLCanvasElement) {
      const rect = e.target.getClientRects()[0];

      const { clientX, clientY } = e;
      const { x, y } = { x: clientX - rect.x, y: clientY - rect.y };

      const selectedIndex = this.state.circles.findIndex((circle) => {
        return (x - circle.x) ** 2 + (y - circle.y) ** 2 <= circle.diameter;
      });

      const updated = [...this.state.circles];

      if (selectedIndex !== -1) {
        const original = updated[selectedIndex];
        updated[selectedIndex] = {
          ...original,
          fill: SELECTED_FILL,
        };

        this.state.circles = updated;
        return;
      }

      updated.push({
        x,
        y,
        fill: DEFAULT_FILL,
        diameter: this.state.diameter,
        selected: false,
      });
      this.state.circles = updated;
      return;
    }
  }

  private handleCanvasRightClick(e: MouseEvent) {
    if (e.target instanceof HTMLCanvasElement) {
      e.preventDefault();

      const rect = e.target.getClientRects()[0];

      const { clientX, clientY } = e;
      const { x, y } = { x: clientX - rect.x, y: clientY - rect.y };

      const selectedIndex = this.state.circles.findIndex((circle) => {
        return (x - circle.x) ** 2 + (y - circle.y) ** 2 <= circle.diameter;
      });

      if (selectedIndex !== -1) {
        const updated = [...this.state.circles];
        const original = updated[selectedIndex];
        const updatedItem = {
          ...original,
          selected: true,
        };
        updated[selectedIndex] = updatedItem;

        this.state.circles = updated;

        const updatedUndos = [...this.state.undos];
        updatedUndos.push(updatedItem);

        this.state.undos = updatedUndos;
        this.state.historyCursor = this.state.undos.length - 1;

        this.portal();
        out.dialogRef.showModal();
      }
    }
  }

  private handleDialogClick(e: MouseEvent) {
    if (
      e.target &&
      e.target instanceof HTMLDialogElement &&
      e.target.nodeName === "DIALOG"
    ) {
      out.dialogRef.close();

      const selectedIndex = this.state.circles.findIndex((circle) => {
        return circle.selected;
      });

      if (selectedIndex !== -1) {
        const updated = [...this.state.circles];
        const original = updated[selectedIndex];
        const updatedItem = {
          ...original,
          selected: false,
        };
        updated[selectedIndex] = updatedItem;

        const updatedRedos = [...this.state.redos];
        updatedRedos.push(updatedItem);

        this.state.redos = updatedRedos;
        this.state.circles = updated;

        return;
      }
    }
  }

  private handleInputInput(e: InputEvent) {
    if (e.target instanceof HTMLInputElement) {
      const selectedIndex = this.state.circles.findIndex((circle) => {
        return circle.selected;
      });

      if (selectedIndex !== -1) {
        const updated = [...this.state.circles];
        const original = updated[selectedIndex];
        updated[selectedIndex] = {
          ...original,
          diameter: +e.target.value,
        };
        this.state.circles = updated;
      }
    }
  }

  private drawCircle({
    x,
    y,
    diameter,
    fill,
    ctx,
  }: {
    x: number;
    y: number;
    diameter: number;
    fill: string;
    ctx: CanvasRenderingContext2D;
  }) {
    ctx.beginPath();
    ctx.arc(x, y, diameter, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  private initCircles() {
    this.state.circles.forEach((circle) => {
      const { x, y, diameter, fill } = circle;
      this.drawCircle({
        x,
        y,
        diameter,
        fill,
        ctx: out.ctx,
      });
    });
  }

  private portal() {
    const p = out.dialogPortal;

    const selectedIndex = this.state.circles.findIndex((circle) => {
      return circle.selected;
    });

    if (this.state.circles.length !== 0 && selectedIndex === -1) {
      alert("not selected");
    }

    const { x, y } = this.state.circles[selectedIndex] ?? { x: 0, y: 0 };

    p.innerHTML = `
      <dialog class="frame-wrapper ${PREFIX}-dialog">
        <div class="frame-contents-row gap-12">
          <span>Adjust diameter of cirlce at (${x.toFixed(0)}, ${y.toFixed(
            0,
          )}).</span>
          <input id="${
            INPUT.diameter
          }" type="range" value="${DEFAULT_DIAMETER}"/>
        </div>
      </dialog> 
    `;

    const dialog = p.querySelector("dialog");
    const diameterInput = p.querySelector(`#${INPUT.diameter}`);

    dialog.addEventListener("click", this.handleDialogClick.bind(this));
    diameterInput.addEventListener("input", this.handleInputInput.bind(this));

    out.dialogRef = dialog;
  }

  protected template() {
    const t = document.createElement("template");

    t.innerHTML = `
      <div class="frame-wrapper">
        <div class="frame-title">CircleDraw</div>
        <div class="frame-contents-row gap-12">
          <div class="flex gap-12 justify-center">
            <button class="${BUTTON.undo}">Undo</button>
            <button class="${BUTTON.redo}">Redo</button>
          </div>
          <canvas id="${PREFIX}-canvas" />
        </div>
      </div>
    `;

    return t.content;
  }

  protected events() {
    const t = this.template();

    const canvas = t.querySelector("canvas");

    const undoButton = t.querySelector(`.${BUTTON.undo}`);
    const redoButton = t.querySelector(`.${BUTTON.redo}`);

    canvas.addEventListener("click", this.handleCanvasClick.bind(this));
    canvas.addEventListener(
      "contextmenu",
      this.handleCanvasRightClick.bind(this),
    );

    undoButton.addEventListener("click", this.handleButtonClick.bind(this));
    redoButton.addEventListener("click", this.handleButtonClick.bind(this));

    out.ctx = canvas.getContext(CONTEXT_ID);

    this.initCircles();

    return t;
  }
}
