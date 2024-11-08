import { CLASSNAMES, ROLES } from "./Constants.js";
import { setMaxPlayers, insertTextContent, deletePlayer } from "./helpers.js";

class Screen {
  children = {
    mainBtn: "[main-btn]",
  };
  constructor(name, rootElement) {
    this.name = name;
    this.rootElement = rootElement;
    this.isActive = false;
  }

  activate() {
    this.rootElement.classList.add(CLASSNAMES.visible);
    this.isActive = true;
    const mainBtn = this.rootElement.querySelector(this.children.mainBtn);
    if (mainBtn) setTimeout(() => (mainBtn.disabled = false), 2000);
  }
  deactivate() {
    this.rootElement.classList.remove(CLASSNAMES.visible);
    this.isActive = false;
    const mainBtn = this.rootElement.querySelector(this.children.mainBtn);
    if (mainBtn) mainBtn.disabled = true;
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
    if (eventTarget.closest(this.children.mainBtn)) this.mainBtnHandler(Game);
  }
  mainBtnHandler(Game) {
    Game.players.setRoles(Game.Settings.spyQuantity);
    Game.players.setNextPlayerToRender();
    Game.location.setRandomLocation();
    Game.Screen.setStartScreen();
    Game.Screen.screenStart.renderPlayer(
      Game.players.nextPlayerToRender.value.player,
      Game.location.current
    );
  }
  renderPlayers(players = []) {
    this.rootElement.querySelector(this.children.listPlayers).innerHTML =
      players
        .map(
          ({ name }) => `
          <li data-player="${name}">
            <p class="player-elem">${name}</p>
            <button type="button" class="btn-sm"></button>
          </li>`
        )
        .join("");
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
    const inputValue = input.value.trim();
    if (!inputValue) {
      const btn = form.querySelector("button");
      btn.disabled = true;
      setTimeout(() => (btn.disabled = false), 1000);
      return;
    }
    try {
      Game.players.addPlayer(inputValue);
      this.renderPlayers(Game.players.all);
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
  onLastPlayerHandler(Game) {
    Game.Screen.setProcessScreen();
    const secondsForTimer = Game.Settings.timerDuration * 60;
    Game.Screen.screenProcess.displayTimer(secondsForTimer);
    if (Game.Settings.timerDuration <= 0) return;
    setTimeout(() => Game.startTimer(secondsForTimer), 1000);
  }
  mainBtnHandler(Game) {
    const btn = this.rootElement.querySelector(this.children.mainBtn);
    const card = this.rootElement.querySelector(this.children.card);
    const isCardWithClass = card.classList.contains(CLASSNAMES.visible);
    if (isCardWithClass) {
      Game.players.setNextPlayerToRender();
      if (Game.players.nextPlayerToRender.done) {
        card.classList.remove(CLASSNAMES.visible);
        return this.onLastPlayerHandler(Game);
      }
      card.addEventListener(
        "transitionend",
        () => {
          Game.Screen.screenStart.renderPlayer(
            Game.players.nextPlayerToRender.value.player,
            Game.location.current
          );
        },
        { once: true }
      );
    }
    btn.textContent = isCardWithClass
      ? "Посмотреть роль"
      : Game.players.length - 1 === Game.players.nextPlayerToRender.value.index
      ? "Начать игру"
      : "Следующий игрок";

    btn.disabled = true;
    card.classList.toggle(CLASSNAMES.visible);
    setTimeout(() => (btn.disabled = false), 2000);
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

    this.rootElement.querySelector("[data-player-img]").style.cssText = `
      background-image: url(${
        isInnocent ? location.source : "./images/icons/icon_spy.svg"
      });
      background-size: ${isInnocent ? "cover" : "auto 80%"};
      `;
  }
}
class ScreenProcess extends Screen {
  constructor() {
    super("process", document.getElementById("section_process"));
  }
  handleEvents(eventTarget, Game) {
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
      "time",
      `${minutesLeft}:${secondsLeft < 10 ? 0 : ""}${secondsLeft}`
    );
    if (seconds <= 0)
      setTimeout(() => insertTextContent(this.rootElement, "time", ""), 100);
  }
}
class ScreenFinal extends Screen {
  constructor() {
    super("final", document.getElementById("section_final"));
  }
  handleEvents(eventTarget, Game) {
    if (eventTarget.closest(this.children.mainBtn)) this.mainBtnHandler(Game);
  }
  render(location, spyPlayers) {
    this.rootElement
      .querySelector("[data-final-img]")
      .style.setProperty("background-image", `url(${location.source})`);
    insertTextContent(this.rootElement, "[data-final-map]", location.name);
    insertTextContent(
      this.rootElement,
      "[data-final-spy]",
      spyPlayers.length === 0
        ? "Нет шпионов"
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
    this.currentScreen = this.screenStart;
    this.toggleScreen();
  }
  setProcessScreen() {
    this.currentScreen = this.screenProcess;
    this.toggleScreen();
  }
  setFinalScreen() {
    this.currentScreen = this.screenFinal;
    this.toggleScreen();
  }

  get current() {
    return this.currentScreen;
  }

  eventHandler(eventTarget) {
    this.currentScreen.handleEvents(eventTarget, this.Game);
  }
}
