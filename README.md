> 最近确实业务上需要, 简单学习了ThreeJS的API, 这个项目里的建模是用的`HT for Web`的建模, 侵权请联系我...
文章中代码不全, 需要了解的可以访问仓库: [https://github.com/klren0312/threejs_ocean_ship](https://github.com/klren0312/threejs_ocean_ship)

![效果图](https://upload-images.jianshu.io/upload_images/2245742-fc738c4108a50dfa.gif?imageMogr2/auto-orient/strip)
# 一. 相关库
> 项目里用到的相关库, 基本都在ThreeJS项目文件夹里[https://github.com/mrdoob/three.js/tree/dev/examples/js](https://github.com/mrdoob/three.js/tree/dev/examples/js)

1. three.js 核心库: [https://github.com/mrdoob/three.js/blob/dev/build/three.min.js](https://github.com/mrdoob/three.js/blob/dev/build/three.min.js)
2. OrbitControls 相机控制库: [https://github.com/mrdoob/three.js/blob/dev/examples/js/controls/OrbitControls.js](https://github.com/mrdoob/three.js/blob/dev/examples/js/controls/OrbitControls.js)
相机有很多种控制方式, 具体可以查看文档
3. OBJLoader 模型加载库: [https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/OBJLoader.js](https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/OBJLoader.js)
4. MTLLoader贴图加载库: [https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/MTLLoader.js](https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/MTLLoader.js)
5. CSS2DRenderer 2D渲染库: [https://github.com/mrdoob/three.js/blob/dev/examples/js/renderers/CSS2DRenderer.js](https://github.com/mrdoob/three.js/blob/dev/examples/js/renderers/CSS2DRenderer.js)
6. water 水纹库: [https://github.com/mrdoob/three.js/blob/dev/examples/js/objects/Water.js](https://github.com/mrdoob/three.js/blob/dev/examples/js/objects/Water.js)

# 二. 开发中遇到的小问题
### 1. 鼠标移动或者点击到导入的模型, 如何捕获
**解决方法:** 
官方提供了射线捕获的接口 `raycaster.intersectObjects`, 但是只能识别自建的`Mesh`模型, 对于导入的模型则无法捕获, 主要是因为导入的模型最外层包了一层, 没有把自己内部的Mesh暴露出来
所以我们需要在模型导入后, 在`onProgress`回调中对其进行递归获取子`Mesh`, 将所有`Mesh`存在一个全局数组中. 在鼠标事件触发时, 将全局数组提供给`raycaster.intersectObjects`, 即可识别
*1. 递归函数*
```javascript
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
```
*2.mtlLoader的onProgress事件*
```javascript
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
  }
```
*3.鼠标点击事件*
```javascript
function handleMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  var intersects = raycaster.intersectObjects(objectArr)
  // console.log('当前点击的Mash', intersects)
  if (intersects && intersects.length > 0) {
  }
}
```
### 2. 如何显示2D平面?
2D平面展示有两种, 一种是这个项目里的鼠标触碰直升机的提示牌, 时刻与摄像头在同一角度的2D平面; 另一种是只在一个方向上可见的2D平面
![多角度可见的2D平面](https://upload-images.jianshu.io/upload_images/2245742-ab71ca4121750694.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![固定角度可见的2D平面](https://upload-images.jianshu.io/upload_images/2245742-7be0dac28aafe989.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**解决方法**
1. 首先是第一种, 多角度的2D平面. 我们需要用到`CSS2DRenderer`对其进行渲染, 即创建一个DOM, 将其赋给`CSS2DRenderer`, 下面代码没有设置坐标, 我是放在鼠标移动事件里设置的
```javascript
  var planeInfo = document.createElement('div')
  planeInfo.className = 'the-modal'
  planeInfo.innerHTML = '<div>治电护航直升机</div>' +
    '<div>ZZES 007 </div>'
  planeInfo.classList.add('hide')
  infoModal = new THREE.CSS2DObject(planeInfo)
  scene.add(infoModal)
```

2. 第二种, 固定角度2D平面. 原理是, 创建一个矩形`Mesh`, 然后创建一个canvas内容, 作为其贴图.
```javascript
var tipsGeo2 = new THREE.PlaneBufferGeometry(3, 1, 1, 1)
var tips2 = new THREE.Mesh(tipsGeo2, createFont('测试测试', {bgColor: '#E6A23C', fontColor: '#FFFFFF'}))
tips2.position.set(9, 1.5, -3)
tips2.rotation.y = 3.15
scene.add(tips2)
```
*封装的canvas函数*
```javascript
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
```
### 3. 如何让船动起来?
**解决方法:** 动画一般就放在固定的动画函数里, 通过`requestAnimationFrame`维持60帧

```javascript
function initAnimate() {
	renderer.render(scene, camera)
	labelRenderer.render(scene, camera)
	if (movePlane) {
		movePlane.position.x -= 0.2
		if (movePlane.position.x < -10) {
			movePlane.position.y += 0.02
		}
		if (movePlane.position.x < -100) {
			movePlane.position.x = 35
			movePlane.position.y = 0
		}
		planeAnimateModal.position.set(movePlane.position.x, movePlane.position.y + 3, movePlane.position.z)
		planeAnimateModal.element.classList.remove('hide')
	}
	requestAnimationFrame(initAnimate)
}
```

### 4. 屏幕大小变化, 如何等比缩放?
**解决方法:**
```javascript
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', handleWindowResize, false)
```

# 三.参考资料
1. threejs文档: [https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)

2. threejs官方示例: [https://threejs.org/examples/#webgl_animation_cloth](https://threejs.org/examples/#webgl_animation_cloth)

3. threejs官方github: https://github.com/mrdoob/three.js
