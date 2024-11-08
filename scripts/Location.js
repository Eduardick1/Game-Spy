import { LOCATIONS } from "./Constants.js";
import { getRandomIndex } from "./helpers.js";

class Location {
  constructor(name, sourceToImage) {
    this.name = name;
    this.source = sourceToImage;
    this.isActive = true;
  }
}

export class LocationsManager {
  constructor(locations = []) {
    this.locations =
      locations.length > 0
        ? locations
        : LOCATIONS.map(({ name, imagesrc }) => new Location(name, imagesrc));
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
