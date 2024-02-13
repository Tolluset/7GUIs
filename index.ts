import { TemperatureConverter } from "./src/temperature-converter/temperature-converter.js";
// import { Counter } from "./src/counter/counter.js";
import { FlightBooker } from "./src/flight-booker/flight-booker.js";
import { Timer } from "./src/timer/timer.js";
import { CRUD } from "./src/crud/crud.js";
import { CircleDrawer } from "./src/circle-drawer/circle-drawer.js";
import { Cells } from "./src/cells/cells.js";

import Counter from "./src/counter/counter.v2.js";
import FlightBooker2 from "./src/flight-booker/flight-booker.v2.js";

const main = () => {
  const app = document.querySelector("#app");

  if (!app) {
    throw new Error("App not found");
  }

  app.appendChild(Counter());
  app.appendChild(FlightBooker2());

  // new Counter(app);

  // new TemperatureConverter(app);
  new FlightBooker(app);
  // new Timer(app);
  // new CRUD(app);
  // new CircleDrawer(app);
  // new Cells(app);
};

main();
