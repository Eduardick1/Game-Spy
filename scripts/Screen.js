import { CLASSNAMES, ROLES } from "./Constants.js";
import {
  setMaxPlayers,
  insertTextContent,
  deletePlayer,
  debounceButton,
  setStyleProp,
  createPlayerNode,
} from "./helpers.js";

class Screen {
  children = {
    mainBtn: "[main-btn]",
  };
  constructor(name, rootElement) {
    this.name = name;
    this.rootElement = rootElement;
    // this.isActive = false;
  }

  activate() {
    this.rootElement.classList.add(CLASSNAMES.visible);
    // this.isActive = true;
    const mainBtn = this.rootElement.querySelector(this.children.mainBtn);
    if (mainBtn) debounceButton(mainBtn, 2000);
  }
  deactivate() {
    this.rootElement.classList.remove(CLASSNAMES.visible);
    // this.isActive = false;
  }
}

class ScreenPrepare extends Screen {
  constructor() {
    super("prepare", document.getElementById("section_prepare"));
    this.children.listPlayers = "#list_prepare";
    this.children.formAddPlayer = "form.form_prepare";
  }
  handleEvents(eventTarget, Game) {
    if (eventTarget.closest(this.children.listPlayers))
      this.playersListHandler(eventTarget, Game);
    else
      this.rootElement
        .querySelector(this.children.listPlayers)
        .querySelectorAll(`.${CLASSNAMES.toDelete}`)
        .forEach((li) => li.classList.remove(CLASSNAMES.toDelete));
    if (
      eventTarget.closest(this.children.formAddPlayer) &&
      eventTarget.closest("button")
    )
      this.playerformHandler(Game);
    if (eventTarget.closest(this.children.mainBtn))
      Game.Screen.setStartScreen();
  }

  renderNewPlayer(playerName) {
    this.rootElement
      .querySelector(this.children.listPlayers)
      .appendChild(createPlayerNode(playerName));
  }
  toggleClassMainBtn(playersQuantity) {
    this.rootElement
      .querySelector(this.children.mainBtn)
      .classList.toggle(CLASSNAMES.hidden, playersQuantity < 3);
  }
  playerformHandler(Game) {
    const form = document.forms.prepare;
    form.classList.remove(CLASSNAMES.invalid);
    const input = form.player;
    const inputValue = input.value.slice(0, 50).trim(); // 50 max string length
    if (!inputValue) return debounceButton(form.querySelector("button"));
    try {
      Game.players.addPlayer(inputValue);
      this.renderNewPlayer(inputValue);
      this.toggleClassMainBtn(Game.players.length);
      setMaxPlayers(Game.players.length);
    } catch (error) {
      form.classList.add(CLASSNAMES.invalid);
      form.setAttribute("error", error.message);
    }
    input.value = "";
  }
  playersListHandler(node, Game) {
    const liElem = node.closest("li");
    if (!liElem) return;
    if (node.closest("button")) deletePlayer(liElem, Game);
    liElem.classList.toggle(CLASSNAMES.toDelete);
  }
}
class ScreenStart extends Screen {
  constructor() {
    super("start", document.getElementById("section_start"));
    this.children.card = ".card";
  }

  handleEvents(eventTarget, Game) {
    if (eventTarget.closest(this.children.mainBtn)) this.mainBtnHandler(Game);
  }
  mainBtnHandler(Game) {
    const btn = this.rootElement.querySelector(this.children.mainBtn);
    const card = this.rootElement.querySelector(this.children.card);
    const isCardOpen = card.classList.contains(CLASSNAMES.visible);
    const { players, Screen, location } = Game;
    if (isCardOpen) {
      players.setNextPlayerToRender();
      if (players.nextPlayerToRender.done) {
        card.classList.remove(CLASSNAMES.visible);
        return Screen.setProcessScreen();
      }
      card.addEventListener(
        "transitionend",
        () => {
          this.renderPlayer(
            players.nextPlayerToRender.value.player,
            location.current
          );
        },
        { once: true }
      );
    }
    btn.textContent = isCardOpen
      ? "Посмотреть роль"
      : players.length - 1 === players.nextPlayerToRender.value.index
      ? "Начать игру"
      : "Следующий игрок";

    debounceButton(btn, 2000);
    card.classList.toggle(CLASSNAMES.visible);
  }
  renderPlayer(playerToRender, location) {
    const isInnocent = playerToRender.role === ROLES.innocent;
    [
      {
        selector: "[data-player-name]",
        textContent: playerToRender.name,
      },
      {
        selector: "[data-player-location]",
        textContent: isInnocent ? location.name : "Неизвестно",
      },
      {
        selector: "[data-player-role]",
        textContent: isInnocent ? "Мирный житель" : "Шпион",
      },
      {
        selector: "[data-player-target]",
        textContent: `Вычислить ${isInnocent ? "шпиона" : "локацию"}!`,
      },
    ].forEach(({ selector, textContent }) =>
      insertTextContent(this.rootElement, selector, textContent)
    );
    [
      {
        property: "background-image",
        value: `url(${
          isInnocent ? location.source : "./images/icons/icon_spy.svg"
        })`,
      },
      {
        property: "background-size",
        value: isInnocent ? "cover" : "auto 80%",
      },
    ].forEach(({ property, value }) =>
      setStyleProp(this.rootElement, "[data-player-img]", property, value)
    );
  }
}
class ScreenProcess extends Screen {
  constructor() {
    super("process", document.getElementById("section_process"));
    this.children.timer = "time";
  }
  handleEvents(eventTarget, Game) {
    if (!eventTarget.closest("section")) return;
    Game.toggleTimer();
    document
      .querySelector(".modal[data-modal=winners]")
      .classList.add(CLASSNAMES.visible);
  }
  displayTimer(seconds) {
    let minutesLeft = Math.trunc(seconds / 60);
    let secondsLeft = seconds % 60;
    insertTextContent(
      this.rootElement,
      this.children.timer,
      `${minutesLeft}:${secondsLeft < 10 ? 0 : ""}${secondsLeft}`
    );
    if (seconds <= 0)
      setTimeout(
        () => insertTextContent(this.rootElement, this.children.timer, ""),
        100
      );
  }
}
class ScreenFinal extends Screen {
  constructor() {
    super("final", document.getElementById("section_final"));
  }
  handleEvents(eventTarget, Game) {
    if (eventTarget.closest(this.children.mainBtn)) this.mainBtnHandler(Game);
  }
  render(location, spyPlayers, totalPlayers) {
    setStyleProp(
      this.rootElement,
      "[data-final-img]",
      "background-image",
      `url(${location.source})`
    );
    insertTextContent(this.rootElement, "[data-final-map]", location.name);
    insertTextContent(
      this.rootElement,
      "[data-final-spy]",
      spyPlayers.length === 0
        ? "Нет шпионов"
        : spyPlayers.length === totalPlayers
        ? "Все шпионы"
        : spyPlayers.map(({ name }) => name).join(", ")
    );
  }
  mainBtnHandler(Game) {
    Game.reload();
  }
}

export class ScreenManager {
  screens = [];
  constructor(game) {
    this.Game = game;
    this.screenPrepare = new ScreenPrepare();
    this.screenStart = new ScreenStart();
    this.screenProcess = new ScreenProcess();
    this.screenFinal = new ScreenFinal();
    this.screens.push(
      this.screenPrepare,
      this.screenStart,
      this.screenProcess,
      this.screenFinal
    );
    this.setPrepareScreen();
  }

  toggleScreen() {
    this.screens.forEach((scr) => {
      if (scr.name === this.currentScreen.name) scr.activate();
      else scr.deactivate();
    });
  }
  setPrepareScreen() {
    this.currentScreen = this.screenPrepare;
    this.toggleScreen();
  }
  setStartScreen() {
    const { players, location, Settings } = this.Game;
    players.setRoles(Settings.spyQuantity);
    players.setNextPlayerToRender();
    location.setRandomLocation();
    this.currentScreen = this.screenStart;
    this.toggleScreen();
    this.screenStart.renderPlayer(
      players.nextPlayerToRender.value.player,
      location.current
    );
  }
  setProcessScreen() {
    const timeDuration = this.Game.Settings.timerDuration;
    const secondsForTimer = timeDuration * 60;
    this.currentScreen = this.screenProcess;
    this.toggleScreen();
    this.screenProcess.displayTimer(secondsForTimer);
    if (timeDuration <= 0) return;
    setTimeout(() => this.Game.startTimer(secondsForTimer), 1000);
  }
  setFinalScreen() {
    this.currentScreen = this.screenFinal;
    this.toggleScreen();
    this.screenFinal.render(
      this.Game.location.current,
      this.Game.players.getFilteredPlayersBySpyRole(),
      this.Game.players.length
    );
  }

  get current() {
    return this.currentScreen;
  }

  eventHandler(eventTarget) {
    this.currentScreen.handleEvents(eventTarget, this.Game);
  }
}
