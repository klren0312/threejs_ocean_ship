var stats
var scene, camera, renderer
var water
// 鼠标点击定位
var raycaster = new THREE.Raycaster()
var mouse = new THREE.Vector2()
// 鼠标移动定位
var raycaster2 = new THREE.Raycaster()
var mouse2 = new THREE.Vector2()
var objectArr = [] // 存放场景中所有mesh
// 提示框
var infoModal, labelRenderer

var engineerShip, thingsShip, helicopter

// ===============  开启帧数检测 ======================
function initStats() {
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.style.position = 'absolute';
  stats.dom.style.right = '0px';
  stats.dom.style.left = 'unset';
  stats.dom.style.top = '0px';
  document.body.appendChild(stats.dom);

  function animate() {
    stats.begin();
    stats.end();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ===========  初始化场景  ========================
function initScene() {
  scene = new THREE.Scene(); //场景构建
  // 构建一个坐标轴
  var axes = new THREE.AxisHelper(120);
  scene.add(axes);
}

// =========== 渲染器构建 ========================
function initRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true, // 抗锯齿
    alpha: true // 背景透明
  }); //渲染器构建
  renderer.setClearAlpha(0); // 透明度为0
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true; //激活阴影
  document.querySelector("#WebGL-output").appendChild(renderer.domElement)
}

// =========== 2D渲染器构建 =====================
function init2DRenderer() {
  labelRenderer = new THREE.CSS2DRenderer()
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = 0
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.querySelector('#WebGL-output').appendChild(labelRenderer.domElement);
}

// ===============  初始化摄像头 ================
function initCamera() {
  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000); //相机构建
  camera.position.x = 163;
  camera.position.y = 80;
  camera.position.z = -89;
  camera.lookAt(scene.position)
}

// ==================== 添加轨道控制器 =========================
function initControl() {
  var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.target = new THREE.Vector3(0, 0, 0) // 控制焦点
  orbitControls.autoRotate = false // 自动旋转关闭
  renderScene();

  function renderScene() {
    var clock = new THREE.Clock() // 用于更新轨道控制器
    var delta = clock.getDelta() // 获取时间差
    orbitControls.update(delta) // 更新时间
    requestAnimationFrame(renderScene);
  }
}

// ================== 灯光 =============================
function initLights() {
  scene.add(new THREE.AmbientLight(0x0c0c0c));
  //添加材质灯光阴影
  var spotLight1 = new THREE.SpotLight(0xffffff);
  spotLight1.position.set(-50, 100, 0);
  scene.add(spotLight1);

  var spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.position.set(550, 500, 0);
  scene.add(spotLight2);

  var spotLight3 = new THREE.SpotLight(0xffffff);
  spotLight3.position.set(150, 50, -200);
  scene.add(spotLight3);

  var spotLight4 = new THREE.SpotLight(0xffffff);
  spotLight4.position.set(150, 50, 200);
  scene.add(spotLight4);

  var spotLight5 = new THREE.SpotLight(0xffffff);
  spotLight5.position.set(-500, 10, 0);
  scene.add(spotLight5);
}

// =================== model 加载 ================================
// 递归出所有mesh
function getMesh(s, arr, name = '') {
  s.forEach(v => {
    if (v.children && v.children.length > 0) {
      getMesh(v.children, arr, v.name)
    } else {
      if (v instanceof THREE.Mesh) {
        if (name) {
          v.name = name
        }
        arr.push(v)
      }
    }
  })
}

function initObjModel() {
  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      // 每次加载完毕将mesh放进数组
      if (percentComplete === 100) {
        objectArr = []
        scene.traverse(function (s) {
          if (s && s.type === 'Scene') {
            getMesh(s.children, objectArr)
          }
        })
      }
    }
  };
  var onError = function (xhr) {};
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath('objs/');
  // 工程船
  mtlLoader.load('工程船.mtl', function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('objs/');
    objLoader.load('工程船.obj', function (object) {
      object.position.x = -50;
      object.position.z = -50;
      object.position.y = 0;
      object.scale.set(0.005, 0.005, 0.005);
      object.name = 'engineerShip';
      engineerShip = object
      scene.add(object);
    }, onProgress, onError);
  });
  // 运输船
  mtlLoader.load('运输船.mtl', function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('objs/');
    objLoader.load('运输船.obj', function (object) {
      object.position.x = 50;
      object.position.z = 50;
      object.position.y = 0;
      object.scale.set(0.2, 0.2, 0.2);
      object.name = 'thingsShip';
      thingsShip = object
      scene.add(object);
    }, onProgress, onError);
  });
  // 直升机
  mtlLoader.load('直升机.mtl', function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('objs/');
    objLoader.load('直升机.obj', function (object) {
      object.position.x = 0;
      object.position.z = 0;
      object.position.y = 30;
      object.scale.set(100, 100, 100);
      object.name = 'helicopter';
      helicopter = object
      scene.add(object);
    }, onProgress, onError);
  });
  // 水面
  var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
  var light = new THREE.DirectionalLight( 0xffffff, 0.8 );
  scene.add( light );
  water = new THREE.Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( '../objs/waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      } ),
      alpha: 1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x00456e,
      distortionScale: 5.7,
      fog: scene.fog !== undefined
    }
  );
  water.rotation.x = - Math.PI / 2;
  scene.add( water );
  // 飞机信息牌
  var planeInfo = document.createElement('div')
  planeInfo.className = 'the-modal'
  planeInfo.innerHTML = '<div>治电护航直升机</div>' +
    '<div>ZZES 007 </div>'
  planeInfo.classList.add('hide')
  infoModal = new THREE.CSS2DObject(planeInfo)
  scene.add(infoModal)
}

// ===================== 创建文字贴图 ======================
/**
 * text 文字
 * options.fontColor 文字颜色
 * options.bgColor 背景颜色
 */
function createFont (text, options={bgColor: '', fontColor: ''}) {
  var canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  var c = canvas.getContext('2d');
  // 矩形区域填充背景
  c.fillStyle = options.bgColor || '#ff0000';
  c.fillRect(0, 0, 512, 128);
  c.beginPath();
  // 文字
  c.beginPath();
  c.translate(256,64);
  c.fillStyle = options.fontColor || '#ffffff'; //文本填充颜色
  c.font = 'bold 36px 微软雅黑'; //字体样式设置
  c.textBaseline = 'middle'; //文本与fillText定义的纵坐标
  c.textAlign = 'center'; //文本居中(以fillText定义的横坐标)
  c.fillText(text, 0, 0);
  var texture = new THREE.CanvasTexture(canvas);
  var textMaterial = new THREE.MeshPhongMaterial({
    map: texture, // 设置纹理贴图
    // side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  });
  textMaterial.map.needsUpdate = true
  return textMaterial
}

// ===================== 方向键控制摄像头 =======================
function initArrowKeydown() {
  document.addEventListener('keydown', handleKeyDown, false);

  function handleKeyDown(e) {
    var e = e || window.event;
    var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
    if ('37, 38, 39, 40, 65, 87, 68, 83'.indexOf(keyCode) === -1) {
      return;
    } else {
      switch (e.keyCode) {
        case 37:
        case 65:
          CameraMove('x', -0.1);
          break;
        case 38:
        case 87:
          CameraMove('y', 0.1);
          break;
        case 39:
        case 68:
          CameraMove('x', 0.1);
          break;
        case 83:
        case 40:
          CameraMove('y', -0.1);
          break;
      }
    }
  }

  function CameraMove(direction, distance) {
    camera.position[direction] += distance;
  }
}

// ===================== 动画 ======================
function initAnimate() {
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  if (engineerShip) {
    engineerShip.position.z += 0.1
    if (engineerShip.position.z >= 50) {
      engineerShip.position.x += 0.01
      engineerShip.rotation.y += 0.001
    }
  }
  if (thingsShip) {
    thingsShip.position.z += 0.1
    if (thingsShip.position.z >= 60) {
      thingsShip.position.x += 0.01
      thingsShip.rotation.y += 0.001
    }
  }
  requestAnimationFrame(initAnimate)
}

// ===================== 鼠标点击触发 ======================
function handleMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  var intersects = raycaster.intersectObjects(objectArr)
  // console.log('当前点击的Mash', intersects)
  if (intersects && intersects.length > 0) {
  }
}

// ================== 鼠标移动触发 =========================
function handleMouseMove(event) {
  mouse2.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse2.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster2.setFromCamera(mouse2, camera)
  var intersects = raycaster2.intersectObjects(objectArr)
  if (intersects && intersects.length > 0) {
    if (intersects[0].object.name.indexOf('helicopter') !== -1) {
      var obj = intersects[0].object
      infoModal.position.copy(obj.parent.position)
      infoModal.position.z -= 100
      infoModal.position.y += 10
      infoModal.element.classList.remove('hide')
    } else {
      infoModal.element.classList.add('hide')
    }
  } else {
    infoModal.element.classList.add('hide')
  }
}

// ===================== 等比缩放 ==========================
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
function initAll() {
  initStats()
  initScene()
  initRenderer()
  init2DRenderer()
  initCamera()
  initControl()
  initLights()
  initObjModel()
  initArrowKeydown()
  initAnimate()
  document.addEventListener('click', handleMouseDown, false);
  document.addEventListener('mousemove', handleMouseMove, false);
  handleWindowResize()
  window.addEventListener('resize', handleWindowResize, false);
}
window.onload = function () {
  initAll()
}