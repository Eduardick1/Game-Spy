import { toggleBtnsParametr } from "./helpers.js";

export class Settings {
  constructor(settings = {}) {
    this.spyQuantity = settings.spyQuantity || 1;
    this.timerDuration = settings.timerDuration || 10; // minutes
  }
  get _spyQuantity() {
    return this.spyQuantity;
  }
  set _spyQuantity(number) {
    this.spyQuantity = number;
  }
  get _timerDuration() {
    return this.timerDuration;
  }
  set _timerDuration(seconds) {
    this.timerDuration = seconds;
  }
  render() {
    document.querySelectorAll("[data-param]").forEach((param) => {
      param.querySelector("input").value = this[param.dataset.param];
      toggleBtnsParametr(param);
    });
  }
}
