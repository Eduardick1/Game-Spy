import { ROLES, CLASSNAMES } from "./Constants.js";

export function getRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

export function renderMaps(maps, isFiltered = false) {
  document.getElementById("maps_container").innerHTML = maps
    .filter((map) => (isFiltered ? map.isActive : map))
    .map(
      ({ name, source, isActive }) => `
      <div 
        class="map" 
        data-map="${name}" 
        isactive="${isActive}"
        >
          <img src="${source}" alt="${name}" loading="lazy"/>
          <p>${name}</p>
      </div>`
    )
    .join("");
}

export function setMaxPlayers(maxPlayers) {
  const parametr = document.querySelector("[data-param=spyQuantity]");
  parametr.querySelector("input").setAttribute("max", Math.max(maxPlayers, 1));
  toggleBtnsParametr(parametr);
}

export function toggleBtnsParametr(parametrNode) {
  const { value, max, min } = getInputValues(
    parametrNode.querySelector("input")
  );
  parametrNode.querySelectorAll("[data-param-btn]").forEach((btn) => {
    btn.disabled = btn.dataset.paramBtn === "+" ? value >= max : value <= min;
  });
}

export function getInputValues(inputNode) {
  const value = parseInt(inputNode.value);
  const step = parseInt(inputNode.step);
  const min = parseInt(inputNode.min);
  const max = parseInt(inputNode.max);
  return { value, min, max, step };
}

export function getRoleCondition(spiesQuantity, totalPlayers) {
  if (spiesQuantity <= 0) return () => ROLES.innocent;
  if (spiesQuantity >= totalPlayers) return () => ROLES.spy;
  const indexiesSpy = new Set();
  while (indexiesSpy.size < spiesQuantity) {
    indexiesSpy.add(getRandomIndex(totalPlayers));
  }
  return (index) => (indexiesSpy.has(index) ? ROLES.spy : ROLES.innocent);
}

export function insertTextContent(rootNode, selector, content) {
  rootNode.querySelector(selector).textContent = content;
}
export function setStyleProp(rootNode, selector, property, value) {
  rootNode.querySelector(selector).style.setProperty(property, value);
}

export function deletePlayer(playerNode, Game) {
  playerNode.classList.add(CLASSNAMES.deleting);
  playerNode.addEventListener(
    "animationend",
    () => {
      Game.players.deletePlayer(playerNode.dataset.player);
      playerNode.remove();
      Game.Screen.screenPrepare.toggleClassMainBtn(Game.players.length);
      setMaxPlayers(Game.players.length);
      Game.Settings.spyQuantity = Math.min(
        Game.Settings.spyQuantity,
        Game.players.length
      );
    },
    { once: true }
  );
}

export function debounceButton(btnNode, duration = 1000) {
  btnNode.disabled = true;
  setTimeout(() => (btnNode.disabled = false), duration);
}

export function createPlayerNode(playerName) {
  const li = document.createElement("li");
  li.dataset.player = playerName;
  const playerWrapper = document.createElement("div");
  playerWrapper.className = "player-elem";
  const player = document.createElement("p");
  player.textContent = playerName;
  playerWrapper.appendChild(player);
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-sm";
  deleteBtn.type = "button";
  li.appendChild(playerWrapper);
  li.appendChild(deleteBtn);
  return li;
}
