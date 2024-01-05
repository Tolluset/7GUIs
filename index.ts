import { TemperatureConverter } from "./src/temperature-converter/temperature-converter.js";
import { Counter } from "./src/counter/counter.js";
import { FlightBooker } from "./src/flight-booker/flight-booker.js";

const main = () => {
  const app = document.querySelector("#app");

  if (!app) {
    throw new Error("App not found");
  }

  new Counter(app);
  new TemperatureConverter(app);
  new FlightBooker(app);
};

main();
