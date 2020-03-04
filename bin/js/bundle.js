(function () {
    'use strict';

    var Scene = Laya.Scene;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class CameraMoveScript extends Laya.Script3D {
        constructor() {
            super();
            /** @private */
            this._tempVector3 = new Laya.Vector3();
            this.yawPitchRoll = new Laya.Vector3();
            this.resultRotation = new Laya.Quaternion();
            this.tempRotationZ = new Laya.Quaternion();
            this.tempRotationX = new Laya.Quaternion();
            this.tempRotationY = new Laya.Quaternion();
            this.rotaionSpeed = 0.00006;
        }
        /**
         * @private
         */
        _updateRotation() {
            if (Math.abs(this.yawPitchRoll.y) < 1.50) {
                Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
                // console.log("rotation   1", this.camera.transform.localRotation)
                this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
                // console.log("rotation   2", this.camera.transform.localRotation)
                // 不懂要这一步做啥...不是已经clone了么...
                this.camera.transform.localRotation = this.camera.transform.localRotation;
                // console.log("rotation   3", this.camera.transform.localRotation)
            }
        }
        /**
         * @inheritDoc
         */
        onAwake() {
            Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
            //Laya.stage.on(Event.RIGHT_MOUSE_OUT, this, mouseOut);
            this.camera = this.owner;
        }
        /**
         * @inheritDoc
         */
        onUpdate() {
            var elapsedTime = Laya.timer.delta;
            if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
                var scene = this.owner.scene;
                Laya.KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime); //W
                Laya.KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime); //S
                Laya.KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime); //A
                Laya.KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime); //D
                Laya.KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime); //Q
                Laya.KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime); //E
                var offsetX = Laya.stage.mouseX - this.lastMouseX;
                var offsetY = Laya.stage.mouseY - this.lastMouseY;
                var yprElem = this.yawPitchRoll;
                yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
                yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
                // console.log("offset ", offsetX, offsetY, yprElem.x, yprElem.y)
                this._updateRotation();
            }
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
        }
        /**
         * @inheritDoc
         */
        onDestroy() {
            Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.mouseUp);
        }
        mouseDown(e) {
            this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
            this.isMouseDown = true;
        }
        mouseUp(e) {
            this.isMouseDown = false;
        }
        mouseOut(e) {
            this.isMouseDown = false;
        }
        /**
         * 向前移动。
         * @param distance 移动距离。
         */
        moveForward(distance) {
            this._tempVector3.x = this._tempVector3.y = 0;
            this._tempVector3.z = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        /**
         * 向右移动。
         * @param distance 移动距离。
         */
        moveRight(distance) {
            this._tempVector3.y = this._tempVector3.z = 0;
            this._tempVector3.x = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        /**
         * 向上移动。
         * @param distance 移动距离。
         */
        moveVertical(distance) {
            this._tempVector3.x = this._tempVector3.z = 0;
            this._tempVector3.y = distance;
            this.camera.transform.translate(this._tempVector3, false);
        }
    }

    var Shader3D = Laya.Shader3D;
    class MultiplePassOutlineMaterial extends Laya.BaseMaterial {
        constructor() {
            super();
            MultiplePassOutlineMaterial.initShader();
            this.setShaderName("MultiplePassOutlineShader");
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, 0.01581197);
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, 1);
            this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, new Laya.Vector4(1.0, 1.0, 1.0, 0.0));
        }
        /**
         * @private
         */
        static __init__() {
        }
        /**
         * 获取漫反射贴图。
         * @return 漫反射贴图。
         */
        get albedoTexture() {
            return this._shaderValues.getTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE);
        }
        /**
         * 设置漫反射贴图。
         * @param value 漫反射贴图。
         */
        set albedoTexture(value) {
            this._shaderValues.setTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE, value);
        }
        /**
         * 获取线条颜色
         * @return 线条颜色
         */
        get outlineColor() {
            return this._shaderValues.getVector(MultiplePassOutlineMaterial.OUTLINECOLOR);
        }
        set outlineColor(value) {
            this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, value);
        }
        /**
         * 获取轮廓宽度。
         * @return 轮廓宽度,范围为0到0.05。
         */
        get outlineWidth() {
            return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH);
        }
        /**
         * 设置轮廓宽度。
         * @param value 轮廓宽度,范围为0到0.05。
         */
        set outlineWidth(value) {
            value = Math.max(0.0, Math.min(0.05, value));
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, value);
        }
        /**
         * 获取轮廓亮度。
         * @return 轮廓亮度,范围为0到1。
         */
        get outlineLightness() {
            return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS);
        }
        /**
         * 设置轮廓亮度。
         * @param value 轮廓亮度,范围为0到1。
         */
        set outlineLightness(value) {
            value = Math.max(0.0, Math.min(1.0, value));
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, value);
        }
        static initShader() {
            MultiplePassOutlineMaterial.__init__();
            var attributeMap = {
                'a_Position': Laya.VertexMesh.MESH_POSITION0,
                'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
                'a_Texcoord0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0
            };
            var uniformMap = {
                'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
                'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
                'u_OutlineWidth': Laya.Shader3D.PERIOD_MATERIAL,
                'u_OutlineColor': Laya.Shader3D.PERIOD_MATERIAL,
                'u_OutlineLightness': Laya.Shader3D.PERIOD_MATERIAL,
                'u_AlbedoTexture': Laya.Shader3D.PERIOD_MATERIAL
            };
            // Shader3D.addInclude("Lighting.glsl", LightingGLSL); // 在 Laya.3d.js 中已经添加了  没有必要再次添加
            var customShader = Laya.Shader3D.add("MultiplePassOutlineShader");
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            customShader.addSubShader(subShader);
            let vs1 = `
        attribute vec4 a_Position;
        attribute vec3 a_Normal;

        uniform mat4 u_MvpMatrix;
        uniform float u_OutlineWidth;


        void main()
        {
           vec4 position = vec4(a_Position.xyz + a_Normal * u_OutlineWidth, 1.0);
           gl_Position = u_MvpMatrix * position;
        }`;
            let ps1 = `
        #ifdef FSHIGHPRECISION
            precision highp float;
        #else
           precision mediump float;
        #endif
        uniform vec4 u_OutlineColor;
        uniform float u_OutlineLightness;

        void main()
        {
           vec3 finalColor = u_OutlineColor.rgb * u_OutlineLightness;
           gl_FragColor = vec4(finalColor,0.0);
        }`;
            var pass1 = subShader.addShaderPass(vs1, ps1);
            // pass1.renderState.cull = Laya.RenderState.CULL_FRONT;
            let vs2 = `
        #include "Lighting.glsl"

        attribute vec4 a_Position;
        attribute vec2 a_Texcoord0;

        uniform mat4 u_MvpMatrix;
        uniform mat4 u_WorldMat;

        attribute vec3 a_Normal;
        varying vec3 v_Normal;
        varying vec2 v_Texcoord0;

        void main()
        {
           gl_Position = u_MvpMatrix * a_Position;
           mat3 worldMat=mat3(u_WorldMat);
           v_Normal=worldMat*a_Normal;
           v_Texcoord0 = a_Texcoord0;
           gl_Position=remapGLPositionZ(gl_Position);
        }`;
            let ps2 = `
        #ifdef FSHIGHPRECISION
            precision highp float;
        #else
            precision mediump float;
        #endif
        varying vec2 v_Texcoord0;
        varying vec3 v_Normal;

        uniform sampler2D u_AlbedoTexture;


        void main()
        {
           vec4 albedoTextureColor = vec4(1.0);

           albedoTextureColor = texture2D(u_AlbedoTexture, v_Texcoord0);
           gl_FragColor=albedoTextureColor;
        }`;
            subShader.addShaderPass(vs2, ps2);
        }
    }
    MultiplePassOutlineMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
    MultiplePassOutlineMaterial.OUTLINECOLOR = Shader3D.propertyNameToID("u_OutlineColor");
    MultiplePassOutlineMaterial.OUTLINEWIDTH = Shader3D.propertyNameToID("u_OutlineWidth");
    MultiplePassOutlineMaterial.OUTLINELIGHTNESS = Shader3D.propertyNameToID("u_OutlineLightness");

    class Shader_MultiplePassOutline {
        constructor() {
            this.rotation = new Laya.Vector3(0, 0.01, 0);
            //初始化引擎
            Laya3D.init(0, 0);
            Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
            Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
            //显示性能面板
            Laya.Stat.show();
            //初始化Shader
            MultiplePassOutlineMaterial.initShader();
            //创建场景
            var scene = Laya.stage.addChild(new Laya.Scene3D());
            //创建相机
            var camera = (scene.addChild(new Laya.Camera(0, 0.1, 1000)));
            camera.transform.translate(new Laya.Vector3(0, 0.85, 1.7));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            //创建平行光
            var directionLight = new Laya.DirectionLight();
            scene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(1, 1, 1);
            Laya.Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Laya.Handler.create(this, function (mesh) {
                var layaMonkey = scene.addChild(new Laya.MeshSprite3D(mesh));
                layaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
                layaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
                var customMaterial = new MultiplePassOutlineMaterial();
                //漫反射贴图
                Laya.Texture2D.load("res/threeDimen/skinModel/LayaMonkey2/Assets/LayaMonkey/diffuse.png", Laya.Handler.create(this, function (texture) {
                    customMaterial.albedoTexture = texture;
                }));
                layaMonkey.meshRenderer.sharedMaterial = customMaterial;
                Laya.timer.frameLoop(1, this, function () {
                    layaMonkey.transform.rotate(this.rotation, false);
                });
            }));
        }
    }
    // new Shader_MultiplePassOutline();

    /**
     * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
     * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
     * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
     */
    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            // //添加3D场景
            // var scene: Laya.Scene3D = Laya.stage.addChild(new Laya.Scene3D()) as Laya.Scene3D;
            // //添加照相机
            // var camera: Laya.Camera = (scene.addChild(new Laya.Camera(0, 0.1, 100))) as Laya.Camera;
            // camera.transform.translate(new Laya.Vector3(0, 3, 3));
            // camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
            // //添加方向光
            // var directionLight: Laya.DirectionLight = scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
            // directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            // directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
            // //添加自定义模型
            // var box: Laya.MeshSprite3D = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1))) as Laya.MeshSprite3D;
            // box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
            // var material: Laya.BlinnPhongMaterial = new Laya.BlinnPhongMaterial();
            // Laya.Texture2D.load("res/layabox.png", Laya.Handler.create(null, function(tex:Laya.Texture2D) {
            // 		material.albedoTexture = tex;
            // }));
            // box.meshRenderer.material = material;
            new Shader_MultiplePassOutline();
        }
    }

    /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
    /*
    * 游戏初始化配置;
    */
    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            //根据IDE设置初始化引擎		
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            //兼容微信不支持加载scene后缀场景
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            //加载IDE指定的场景
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    //激活启动类
    new Main();

}());
//# sourceMappingURL=bundle.js.map
