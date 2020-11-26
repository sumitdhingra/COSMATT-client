import { Injectable } from '@angular/core';

export class ProfileElement {
  name: string = "";

  initialVelocity: number = 0;
  finalVelocity: number = 0;

  initialTime: number = 0;
  finalTime: number = 0;

  segmentDuration: number = 0;

  // Not sure if this should be a part of motion element.. To be reviewed / discussed - sumit
  a2t: number = 0;

  initialAcceleration: number = 0;
  finalAcceleration: number = 0;

  initialPosition: number = 0;
  finalPosition: number = 0;

  loadInertia: number = 0;

  // Transmission specific parameters begin
  transmissionRatio: number = 1;
  transmissionEfficiency: number = 100;
  transmissionInertia: number = 1;
  reflectedLoadTorque: number = 0;
  reflectedLoadInertia: number = 0;
  // Transmission specific parameters end

  accelerationTorque: number = 0;
  frictionTorque: number = 0;
  externalTorque: number = 0;
  totalTorque: number = 0; // tq

  tq2Time: number = 0;
  motorInertia = 0;

  motorAccelerationTorque: number = 0;
  totalMotorTorque: number = 0;
}

export class ProfileElementsCollection {

  private _profileElements: ProfileElement[] = [];

  constructor(profileElements: ProfileElement[] = []) {
    this._profileElements = profileElements;
  }

  add(profileElement: ProfileElement) {
    this._profileElements.push(profileElement);
  }

  update(index: number, profileElement: ProfileElement) {
    if (index >= 0 && index < this._profileElements.length) {
      return this._profileElements[index] = profileElement;
    }
  }

  delete(index: number) {
    if (index >= 0 && index < this._profileElements.length) {
      this._profileElements.splice(index, 1);
    }
  }

  get(index: number): ProfileElement {
    if (index >= 0 && index < this._profileElements.length) {
      return this._profileElements[index];
    }
    return null;
  }

  getAll(): ProfileElement[] {
    return this._profileElements;
  }

  clear() {
    this._profileElements = [];
  }

  isEmpty() {
    return this._profileElements.length === 0;
  }

}
