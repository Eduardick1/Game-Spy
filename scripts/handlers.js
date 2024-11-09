import { CLASSNAMES } from "./Constants.js";
import {
  renderMaps,
  toggleBtnsParametr,
  getInputValues,
  debounceButton,
} from "./helpers.js";
export function menuHandler(eventTarget, Game) {
  const modals = {
    maps: renderMaps(
      Game.location.locations,
      Game.Screen.current.name === Game.Screen.screenProcess.name
    ),
    settings: Game.Settings.render(),
  };
  document
    .querySelector(`.modal[data-modal=${eventTarget.dataset.modal}]`)
    .classList.add(CLASSNAMES.visible);
  modals[eventTarget.dataset.modal];
}

export function modalsHandler(eventTarget, Game) {
  const modal = eventTarget.closest(".modal");
  if (eventTarget.closest(".modal [name=btnSubmit]")) {
    if (modal.dataset.modal === "winners") Game.toggleTimer();
    return modal.classList.remove(CLASSNAMES.visible);
  }
  const btnHelp = eventTarget.closest("button.info_btn");
  if (btnHelp) {
    modal.querySelector("#maps_container").classList.toggle("rows");
    debounceButton(btnHelp, 3000);
    return;
  }

  const map = eventTarget.closest(".map");
  const isProcessScreen =
    Game.Screen.current.name === Game.Screen.screenProcess.name;
  if (map && !isProcessScreen) {
    Game.location.toggleLocationPropActive(map.dataset.map);
    map.setAttribute(
      "isActive",
      Game.location.getLocationByName(map.dataset.map).isActive
    );
    return;
  }

  const btnParameter = eventTarget.closest("[data-param-btn]");
  if (btnParameter) {
    const parametr = btnParameter.closest("[data-param]");
    const input = parametr.querySelector("input");
    const { value, min, max, step } = getInputValues(input);
    const isPlusBtn = btnParameter.dataset.paramBtn === "+";
    btnParameter.disabled = isPlusBtn ? value >= max : value <= min;
    const newValue = isPlusBtn
      ? Math.min(max, value + step)
      : Math.max(min, value - step);
    input.value = newValue;
    Game.Settings[parametr.dataset.param] = newValue;
    toggleBtnsParametr(parametr);
  }
  const btnWinner = eventTarget.closest("[data-winner]");
  if (btnWinner) {
    Game.stopTimer();
    Game.setWinners(btnWinner.dataset.winner);
    Game.Screen.setFinalScreen();
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.remove(CLASSNAMES.visible));
    modal
      .querySelector("button[name=btnSubmit]")
      .classList.remove(CLASSNAMES.hidden);
    return;
  }
}

export function toggleModalWinners() {
  const modal = document.querySelector(".modal[data-modal=winners]");
  if (modal.classList.contains(CLASSNAMES.visible)) return;
  modal.classList.add(CLASSNAMES.visible);
  modal
    .querySelector("button[name=btnSubmit]")
    .classList.add(CLASSNAMES.hidden);
}
