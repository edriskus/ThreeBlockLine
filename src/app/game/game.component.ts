import { Component, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { saveAs } from 'save-as'
import { ThreeBlockLine } from '../engine/ThreeBlockLine';
declare const require;
const gameMap = require('../game-map.json');
const gameScenery = require('../game-scenery.json');
const hatchbackModel = require('../../assets/models/Cars/hatchback.json');

const ESCAPE_KEYCODE = 27;
const SPACE_KEYCODE = 32;
const TREE_URL = '/assets/models/Tree/tree.json';
const TREE_COLOR = 0xedb458;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  @ViewChild('game') gameContainer: any;
  private game: ThreeBlockLine;
  winning: any;
  losing: any;
  private objectCreator: Array<any> = [];

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
      if(event.keyCode == 87 /* W */) {
        let pos = Object.assign({}, this.game.playerPosition);
        pos.z = -2;
        pos.x += 6;
        this.objectCreator.push({
          dataUrl: TREE_URL,
          color: TREE_COLOR,
          position: pos
        })
      }
      if(event.keyCode == 65 /* A */) {
        let pos = Object.assign({}, this.game.playerPosition);
        pos.z = -2;
        pos.y += 6;
        this.objectCreator.push({
          dataUrl: TREE_URL,
          color: TREE_COLOR,
          position: pos
        })
      }
      if(event.keyCode == 83 /* S */) {
        let pos = Object.assign({}, this.game.playerPosition);
        pos.z = -2;
        pos.x -= 6;
        this.objectCreator.push({
          dataUrl: TREE_URL,
          color: TREE_COLOR,
          position: pos
        })
      }
      if(event.keyCode == 68 /* D */) {
        let pos = Object.assign({}, this.game.playerPosition);
        pos.z = -2;
        pos.y -= 6;
        this.objectCreator.push({
          dataUrl: TREE_URL,
          color: TREE_COLOR,
          position: pos
        })
      }
  }

  touch() {
    if(this.game && this.game.isPaused) {
      this.resume();
    } else {
      this.move();
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

  exportObjectData() {
    var obj = JSON.stringify({
      objects: this.objectCreator
    });
    let blob = new Blob([obj], { type: 'text/json;charset=utf-8' })
    saveAs(blob, 'objects.json')
  }

  ngAfterViewInit() {
    this.game = new ThreeBlockLine(
      this.gameContainer.nativeElement,
      '/assets/kasabian-king_ray.mp3',
      {
        backgound: 0xebf5df,
        cube: 0xff9000,
        trees: TREE_COLOR,
        path: 0xd4d4aa,
        light: 0xffffff
      }
    );
    this.loadGameMap();
    this.game.events.subscribe(
      res => {
        this.processGameEvent(res);
      }
    )
  }

  private loadGameMap() {
    this.game.loadLine(gameMap.line, 1.5);
    this.game.renderScene(0);
    this.game.addScenery(gameScenery.objects);
  }

  private processGameEvent(evt) {
    switch(evt.type) {
      case 'WIN':
        this.winning = evt.data;
        break;
      case 'LOSE':
        this.losing = evt.data;
        break;
    }
  }

  get isLoading() {
    return !this.game || this.game.loading;
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

  restart() {
    this.winning = null;
    this.losing = null;
    this.game.reset();
    this.loadGameMap();
  }

  get isPaused() {
    return !(this.winning || this.losing) && (!this.game || this.game.isPaused);
  }

}
