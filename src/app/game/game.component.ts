import { Component, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { saveAs } from 'save-as'
import { ThreeBlockLine } from '../engine/ThreeBlockLine';
declare const require;
const gameMap = require('../game-map.json');

const ESCAPE_KEYCODE = 27;
const SPACE_KEYCODE = 32;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  @ViewChild('game') gameContainer: any;
  private game: ThreeBlockLine;

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
      if (event.keyCode === ESCAPE_KEYCODE) {
        this.pause();
      }
      if (event.keyCode === SPACE_KEYCODE) {
        if(this.game && this.game.isPaused) {
          this.resume();
        } else {
          this.move();
        }
      }
  }

  public exportedData: string;

  constructor() { }

  ngOnInit() {

  }

  exportData() {
    var obj = JSON.stringify({
      line: this.game.history
    });
    let blob = new Blob([obj], { type: 'text/json;charset=utf-8' })
    saveAs(blob, 'data.json')
  }

  ngAfterViewInit() {
    this.game = new ThreeBlockLine(
      this.gameContainer.nativeElement,
      '/assets/kasabian-king_ray.mp3'
    );
    this.game.loadLine(gameMap.line, 1.5);
    this.game.renderScene(0);
  }

  move() {
    if(!this.game) return;
    this.game.move();
  }

  pause() {
    if(!this.game) return;
    this.game.pause();
  }

  resume() {
    if(!this.game) return;
    this.game.resume();
  }

  get isPaused() {
    return !this.game || this.game.isPaused;
  }

}
