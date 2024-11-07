import { SpyGame } from "./SpyGame.js";
import { menuHandler, modalsHandler } from "./handlers.js";

document.addEventListener("DOMContentLoaded", () => {
  const Game = new SpyGame();
  document.addEventListener("click", (e) => {
    e.preventDefault();
    const { target } = e;
    if (target.closest(".modal")) return modalsHandler(target, Game);
    if (target.closest(".menu button")) return menuHandler(target, Game);
    Game.Screen.eventHandler(target);
  });
});
