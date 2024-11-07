import { getRoleCondition } from "./helpers.js";
import { ROLES } from "./Constants.js";

class Player {
  constructor(name) {
    // this.id = Date.now();
    this.name = name;
    this.role = undefined;
  }
  set _role(role) {
    this.role = role;
  }
  get _name() {
    return this.name;
  }
  get _role() {
    return this.role;
  }
}

export class PlayersManager {
  constructor(players = []) {
    this.players = players;
    this.nextPlayerToRender = null;
    this.playersToRender = this.yieldPlayers();
  }
  get all() {
    return this.players;
  }
  get length() {
    return this.players.length;
  }

  addPlayer(name) {
    if (this.players.some((player) => player.name === name))
      throw new Error("Player already exists");
    this.players.push(new Player(name));
  }
  deletePlayer(name) {
    this.players = this.players.filter((player) => player.name !== name);
  }
  setRoles(spies) {
    let roleCondition = getRoleCondition(spies, this.players.length);
    this.players = this.players.map((player, index) => {
      return { ...player, role: roleCondition(index) };
    });
  }
  *yieldPlayers() {
    for (let [index, player] of this.players.entries()) {
      yield { index, player };
    }
  }
  setNextPlayerToRender() {
    this.nextPlayerToRender = this.playersToRender.next();
  }
  getFilteredPlayersBySpyRole() {
    return this.players.filter(({ role }) => role === ROLES.spy);
  }
}
