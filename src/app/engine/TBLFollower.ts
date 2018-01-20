import { PerspectiveCamera, Object3D, Vector3 } from "three";

export class TBLFollower {

  get object() {
    return this.scene;
  }

  get camera() {
    return this.cam;
  }

  private cam: PerspectiveCamera;
  private scene: Object3D;

  constructor() {
    this.scene = new Object3D();
    this.scene.position.z = 0;
    this.scene.position.y = 0;
    this.scene.position.x = 0;
    this.setupCamera();
  }

  private setupCamera() {
    this.cam = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.cam.position.x = -5;
    this.cam.position.y = -5;
    this.cam.position.z = 10;
    this.cam.lookAt(new Vector3(0, 0, 0));
    this.cam.rotateZ(- Math.PI / 4);
    this.scene.add(this.cam);
  }

  public follow(player) {
    let data = player.followable;
    (<any>window).historyData = data;
    let delta = data.delta;
    // let direction = data.direction;
    let maybeTakeOne = 0;
    return (change) => {
      change = delta * change / 2;
      if(data.position && this.scene.position.x < data.position.x) {
        this.scene.translateX( change );
      } else {
        if(data.position && this.scene.position.y < data.position.y) {
          this.scene.translateY( change );
        }
      }
      if(data.position && this.scene.position.y < data.position.y) {
        this.scene.translateY( change );
      } else {
        if(data.position && this.scene.position.x < data.position.x) {
          this.scene.translateX( change );
        }
      }
    }
  }
}
