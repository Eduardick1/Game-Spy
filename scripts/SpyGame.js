import { ScreenManager } from "./Screen.js";
import { PlayersManager } from "./Player.js";
import { Settings } from "./settings.js";
import { LocationsManager } from "./Location.js";
import { toggleModalWinners } from "./handlers.js";
export class SpyGame {
  constructor() {
    this.Settings = new Settings();
    this.Screen = new ScreenManager(this);
    this.location = new LocationsManager();
    this.players = new PlayersManager();
    this.timer = null;
    this.isTimerPaused = false;
    this.winnerSide = null;
  }

  startTimer(seconds) {
    let secondsLeft = seconds;
    this.timer = setInterval(() => {
      if (!this.isTimerPaused) {
        secondsLeft--;
        this.Screen.screenProcess.displayTimer(secondsLeft);
        if (secondsLeft <= 0) return this.stopTimer();
      }
    }, 1000);
  }
  toggleTimer() {
    this.isTimerPaused = !this.isTimerPaused;
  }
  stopTimer() {
    clearInterval(this.timer);
    this.isTimerPaused = false;
    toggleModalWinners();
  }
  setWinners(winnerSide) {
    this.winnerSide = winnerSide;
    console.log(this.winnerSide);
  }
  reload() {
    this.Settings = new Settings(this.Settings);
    this.players = new PlayersManager(this.players.all);
    this.location = new LocationsManager();
    this.timer = null;
    this.isTimerPaused = false;
    this.winnerSide = null;
    this.Screen = new ScreenManager(this);
  }
}
