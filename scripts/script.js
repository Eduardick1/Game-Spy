import { SpyGame } from "./SpyGame.js";
import { menuHandler, modalsHandler } from "./handlers.js";
import { deletePlayer } from "./helpers.js";

let touchStart = null;
let touchEnd = null;

document.addEventListener("DOMContentLoaded", () => {
  const Game = new SpyGame();
  function init(event) {
    event.preventDefault();
    const { target } = event;
    if (target.closest(".modal")) return modalsHandler(target, Game);
    if (target.closest(".menu button")) return menuHandler(target, Game);
    Game.Screen.eventHandler(target);
  }
  document.addEventListener("click", init);
  document.addEventListener("touch", init);
  document.addEventListener("touchstart", (e) => {
    touchStart = e.target.closest("#list_prepare li")
      ? e.changedTouches[0].screenX
      : null;
  });

  document.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const node = e.target.closest("#list_prepare li");
    touchEnd = node ? e.changedTouches[0].screenX : null;
    if (
      touchStart > touchEnd &&
      touchStart - touchEnd >=
        document.getElementById("list_prepare").clientWidth / 3
    )
      deletePlayer(node, Game);
  });
});
