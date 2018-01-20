import { Scene, Camera, WebGLRenderer, Object3D, PerspectiveCamera, Vector3, PointLight, Line, Geometry, MeshLambertMaterial, LineBasicMaterial, Mesh, BoxBufferGeometry, ShapeGeometry, Shape, ShapeUtils, MeshBasicMaterial, Face3, ExtrudeGeometry, MeshPhongMaterial, Raycaster, log, JSONLoader } from "three";
import { TBLCube } from "./TBLCube";
import { TBLFollower } from './TBLFollower';
import { Subject } from "rxjs/Subject";

export class ThreeBlockLineOptions {
  backgound: number;
  cube: number;
  trees: number;
  path: number;
  light: number;
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

  private evts = new Subject();
  get events() {
    return this.evts;
  }

  /**
   *
   * @param container - HTML Element that will hold the WebGLRenderer canvas
   * @param options  - Additional parameters to tweak the game
   */
  constructor(
    private container: HTMLElement,
    private audioUrl: string,
    private options: (ThreeBlockLineOptions|any)
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
    this.renderer.setClearColor(this.options.background || 0xffffff, 1)
    this.container.appendChild( this.renderer.domElement );
  }

  private setupPlayer() {
    this.player = new TBLCube(this.scene, 0.01, this.options.cube || 0xaaaaaa );
    this.scene.add(this.player.mesh);
    this.animations.player = this.player.animation;
  }

  private setupFollower() {
    this.follower = new TBLFollower();
    this.scene.add(this.follower.object);
    this.camera = this.follower.camera;
  }

  private setupEnvironment() {
    const pointLight = new PointLight(this.options.light || 0xffffff);
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
   * Add objects
   */
  public addScenery(objects: Array<any>) {
    var mesh;
    for(let obj of objects) {
      var loader = new JSONLoader();
      loader.load(
        // resource URL
        obj.dataUrl,

        // onLoad callback
        ( geometry, materials ) => {
          var material = new MeshLambertMaterial({ color: obj.color });
          var object = new Mesh( geometry, material );
          Object.assign(object.position, obj.position);
          this.scene.add( object );
          this.renderScene(0);
        },

        // onProgress callback
        function ( xhr ) {
          console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function( err ) {
          console.log( 'An error happened' );
        }
      )
    }
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
    var mesh = new Mesh( geometry, new MeshPhongMaterial({ color: this.options.path || 0xeeeeee }) );
    geometry.computeFaceNormals();
    this.scene.add( mesh );
    let rayCaster;
    let rayDirection;
    this.animations.bounds = (change) => {
      if(!this.player.mesh) return;
      rayDirection = Object.assign(new Vector3(), this.player.mesh.position);
      rayDirection.z -= 3;
      rayDirection;
      rayCaster = new Raycaster(this.player.mesh.position, rayDirection.sub(this.player.mesh.position).normalize());
      if(rayCaster.intersectObjects([mesh]).length < 1) {
        this.lose();
      }
    }
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
   * Lose game
   */
  public lose() {
    this.pause();
    this.events.next({
      type: 'LOSE',
      data: {}
    })
  }

  /**
   * Win game
   */
  public win() {
    this.pause();
    this.events.next({
      type: 'WIN',
      data: {}
    })
  }

  /**
   * Reset game
   */
  public reset() {
    this.player = null;
    this.follower = null;
    this.moving = false;
    this.wasPlayed = false;
    this.animations = {};

    this.scene.children.splice(0, this.scene.children.length);
    console.log(this.scene);

    this.setupPlayer();
    this.setupFollower();
    this.setupEnvironment();
    this.setupAudio(this.audioUrl);
    this.animate(0);
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

  /**
   * Get player position
   */
  get playerPosition() {
    return this.player.followable.position;
  }
}
