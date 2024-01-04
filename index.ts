import { Counter } from "./src/counter.js";

const main = () => {
  const app = document.querySelector("#app");

  if (!app) {
    throw new Error("App not found");
  }

  new Counter(app);
};

main();
