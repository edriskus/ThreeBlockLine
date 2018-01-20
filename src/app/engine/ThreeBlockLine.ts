import { Scene, Camera, WebGLRenderer, Object3D, PerspectiveCamera, Vector3, PointLight, Line, Geometry, MeshLambertMaterial, LineBasicMaterial, Mesh, BoxBufferGeometry, ShapeGeometry, Shape, ShapeUtils, MeshBasicMaterial, Face3, ExtrudeGeometry, MeshPhongMaterial } from "three";
import { TBLCube } from "./TBLCube";
import { TBLFollower } from './TBLFollower';

export class ThreeBlockLineOptions {

}

export class ThreeBlockLine {

  private scene: Scene;
  private camera: Camera;
  private renderer: WebGLRenderer;
  private player: TBLCube;
  private follower: TBLFollower;
  private audio;

  private moving: boolean = false;
  private wasPlayed: boolean = false;

  private animations: any = {};

  /**
   *
   * @param container - HTML Element that will hold the WebGLRenderer canvas
   * @param options  - Additional parameters to tweak the game
   */
  constructor(
    private container: HTMLElement,
    private audioUrl: string,
    private options?: ThreeBlockLineOptions
  ) {
    this.setupThree();
    this.setupPlayer();
    this.setupFollower();
    this.setupEnvironment();
    this.setupAudio(audioUrl);
    this.animate(0);
  }

  private setupThree() {
    this.scene = new Scene();
    this.renderer = new WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor(0xffffff, 1)
    this.container.appendChild( this.renderer.domElement );
  }

  private setupPlayer() {
    this.player = new TBLCube(this.scene, 0.01);
    this.scene.add(this.player.mesh);
    this.animations.player = this.player.animation;
  }

  private setupFollower() {
    this.follower = new TBLFollower();
    this.scene.add(this.follower.object);
    this.camera = this.follower.camera;
  }

  private setupEnvironment() {
    const pointLight = new PointLight(0xffffff);
    pointLight.position.x = -5;
    pointLight.position.y = -5;
    pointLight.position.z = 10;
    this.follower.object.add(pointLight);
  }

  private prevousTimestamp: number
  private animate = (now: number) => {
    this.renderScene(now - (this.prevousTimestamp || now));
    this.prevousTimestamp = now;
    if(!this.moving) return;
    requestAnimationFrame(this.animate);
  }

  public renderScene(change: number) {
    this.renderer.render(this.scene, this.camera);
    for(let fn in this.animations) this.animations[fn](change);
  }

  private setupAudio(fileUrl: string) {
    this.audio = new Audio();
    this.audio.src = fileUrl;
    this.audio.load();
  }

  /**
   * Initialize a map line
   */
  public loadLine(history: Array<any>, delta: number) {
    var shape = new Shape();

    for(let i = 0; i < history.length; i++) {
      shape.lineTo(history[i].x + delta, history[i].y - delta);
    }
    shape.lineTo(history[history.length - 1].x + delta, history[history.length - 1].y + delta);
    shape.lineTo(history[history.length - 1].x - delta, history[history.length - 1].y + delta);
    for(let i = history.length - 1; i >= 0; i--) {
      shape.lineTo(history[i].x - delta, history[i].y + delta);
    }
    shape.lineTo(history[0].x - delta, history[0].y - delta);
    shape.lineTo(history[0].x + delta, history[0].y - delta);

    var extrudeSettings = {
      bevelEnabled: false,
      amount: 0.5
    };
    var geometry = new ExtrudeGeometry( shape, extrudeSettings );
    geometry.translate(0, 0, -1);
    var mesh = new Mesh( geometry, new MeshPhongMaterial({ color: 0xeeeeee }) );

    this.scene.add( mesh );
  }

  /**
   * Make a move
   */
  public move() {
    if(!this.wasPlayed) {
      this.wasPlayed = true;
      setTimeout(
        () => {
          this.animations.follower = this.follower.follow(this.player)
        }, 300
      );
    }
    if(!this.moving) {
      this.resume();
    }
    this.animations.player = this.player.move();
  }

  /**
   * Pause everything
   */
  public pause() {
    this.audio.pause();
    this.moving = false;
  }

  /**
   * Resume game
   */
  public resume() {
    if(this.isPaused) {
      this.moving = true;
      this.audio.play();
      this.prevousTimestamp = 0;
      this.animate(0);
    }
  }

  /**
   * Is paused
   */
  get isPaused() {
    return this.wasPlayed && !this.moving;
  }

  /**
   * Get player history
   */
  get history() {
    return this.player.followable.history;
  }
}
