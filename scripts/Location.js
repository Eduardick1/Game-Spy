import { LOCATIONS } from "./Constants.js";
import { getRandomIndex } from "./helpers.js";

class Location {
  constructor(name, sourceToImage) {
    this.name = name;
    this.source = sourceToImage;
    this.isActive = true;
  }

  set _isActive(val) {
    this.isActive = Boolean(val);
  }
  get _isActive() {
    return this.isActive;
  }
  get _name() {
    return this.name;
  }
  get _source() {
    return this.source;
  }
}

export class LocationsManager {
  locations = [];
  constructor() {
    LOCATIONS.forEach(({ name, imagesrc }) =>
      this.locations.push(new Location(name, imagesrc))
    );
    this.currentLocation = null;
  }
  setRandomLocation() {
    const filteredLocations = this.getFilteredLocations();
    const randomIndex = getRandomIndex(filteredLocations.length);
    this.currentLocation = filteredLocations[randomIndex];
  }
  get current() {
    return this.currentLocation;
  }
  toggleLocationPropActive(locationName) {
    const map = this.getLocationByName(locationName);
    if (map) {
      map.isActive =
        this.getFilteredLocations().length > 1 ? !map.isActive : true;
    }
  }
  getLocationByName(locationName) {
    return this.locations.find(({ name }) => name === locationName);
  }
  getFilteredLocations() {
    return this.locations.filter((map) => map.isActive);
  }
}
