import { BoxGeometry, MeshLambertMaterial, Mesh, Scene, Vector3 } from "three";

export class TBLCube {

  get mesh() {
    return this.object;
  }
  get animation() {
    return this.animationFunction;
  }
  get followable() {
    return {
      delta: this.delta,
      history: this.history,
      direction: this.direction,
      position: this.object.position
    };
  }

  private history: Array<Vector3> = [];
  private object: Mesh;
  private direction: number;

  /**
   *
   * @param scene - Used to add trace cube objects
   */
  constructor(
    private scene: Scene,
    private delta: number = 0.005
  ) {
    this.object = this.createCube();
  }

  private createCube() {
    var geometry = new BoxGeometry( 1, 1, 1 );
    var material = new MeshLambertMaterial( { color: 0xeb5160 } );
    return new Mesh( geometry, material );
  }

  private animationFunction: Function = () => {

  }

  private cloneCube() {
    var traceCube: Mesh = this.createCube();
    Object.assign(traceCube.position, this.object.position);
    this.scene.add(traceCube);
    this.totalChange = 0;
  }

  private totalChange: number = 0;
  public move() {
    this.cloneCube();
    this.history.push(Object.assign(new Vector3(), this.object.position));
    if(!this.object) {
      this.object = this.createCube();
    }
    this.direction = this.direction > Math.PI / 2 ? Math.PI / 2 : Math.PI;

    // Define animation function
    if(this.direction > Math.PI / 2) {
      return this.leftAnimation;
    } else {
      return this.rightAnimation;
    }
  }

  private leftAnimation = (change) => {
    change = this.delta * change;
    this.totalChange += change;
    if(this.totalChange > 0.45) {
      this.cloneCube();
    }
    this.object.translateX( change );
  }

  private rightAnimation = (change) => {
    change = this.delta * change;
    this.totalChange += change;
    if(this.totalChange > 0.45) {
      this.cloneCube();
    }
    this.object.translateY( change );
  }

}
