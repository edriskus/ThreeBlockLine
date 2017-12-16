import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Scene, Camera, Renderer, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, LineBasicMaterial, Geometry, Vector3, Line, MeshLambertMaterial, PointLight, Object3D } from 'three';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  public cubeDirection: number = Math.PI;
  public currentCube: any;
  /*
    Game
  */
  move() {
    var traceCube: Mesh = this.addCube();
    Object.assign(traceCube.position, this.currentCube.position);
    if(!this.currentCube) {
      this.currentCube = this.addCube();
      this.currentCube.add(this.camera);
    }
    this.cubeDirection = this.cubeDirection > Math.PI / 2 ? Math.PI / 2 : Math.PI;
    
    // Define animation function
    let delta = 0.1;
    if(this.cubeDirection > Math.PI / 2) {
      this.animations.cube = () => {
        // this.scene.updateMatrixWorld(true);
        this.currentCube.translateX( delta / 2 );
        // (<Geometry>traceCube.geometry).verticesNeedUpdate = true;
        for(let i of [0,1,2,3]) {
          // Object.assign((<Geometry>traceCube.geometry).vertices[i], traceCube.worldToLocal(this.currentCube.localToWorld(this.currentCube.geometry.vertices[i])));
          // console.log(traceCube.worldToLocal(this.currentCube.localToWorld(this.currentCube.geometry.vertices[i])));
          
        }
      }
    } else {
      this.animations.cube = () => {
        this.currentCube.translateZ( delta / 2 );
      }
    }
    
  }


  /*
    Three.js
  */

  @ViewChild('game') gameContainer: any;
  private scene: Scene;
  private camera: Camera;
  private renderer: WebGLRenderer;
  private animations: any = {};
  private follower: Object3D;

  constructor() { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.setupThree();
    this.setupCube();
    // this.addLine();
  }

  private setupThree() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera.position.z = -5;
    this.camera.position.y = 10;
    this.camera.position.x = -5;
    this.camera.lookAt(new Vector3(0, 0, 0));
    
    this.renderer = new WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor(0xffffff, 1)
    
    this.gameContainer.nativeElement.appendChild( this.renderer.domElement );
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    for(let fn in this.animations) this.animations[fn]();
  }

  createLight() {
    // create a point light
    const pointLight = new PointLight(0xffffff);
    pointLight.position.x = 0;
    pointLight.position.y = 10;
    pointLight.position.z = -5;
    return pointLight;
  }

  setupCube() {
    this.currentCube = this.addCube();
    this.currentCube.add(this.camera);
    this.currentCube.add(this.createLight())
  }

  addCube() {
    var geometry = new BoxGeometry( 1, 1, 1 );
    var material = new MeshLambertMaterial( { color: 0xeb5160 } );
    var cube = new Mesh( geometry, material );
    this.scene.add( cube );
    return cube;
  }

}
