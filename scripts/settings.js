import { toggleBtnsParametr } from "./helpers.js";

export class Settings {
  constructor(settings = {}) {
    this.spyQuantity = this.Validate(settings.spyQuantity, 1);
    this.timerDuration = this.Validate(settings.timerDuration, 10);
  }
  Validate(param, fallback) {
    return typeof param === "number" ? param : fallback;
  }
  render() {
    document.querySelectorAll("[data-param]").forEach((param) => {
      param.querySelector("input").value = this[param.dataset.param];
      toggleBtnsParametr(param);
    });
  }
}
