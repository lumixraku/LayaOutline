import GameManager from "../GameManager"
import Vector3 = Laya.Vector3;

export default class CameraFollowScript extends Laya.Script3D {

    /** @private */
    protected _tempVector3: Laya.Vector3 = new Laya.Vector3();
    protected lastMouseX: number;
    protected lastMouseY: number;
    protected lastRoleTransform: Laya.Vector3;
    protected yawPitchRoll: Laya.Vector3 = new Laya.Vector3();
    protected resultRotation: Laya.Quaternion = new Laya.Quaternion();
    protected tempRotationZ: Laya.Quaternion = new Laya.Quaternion();
    protected tempRotationX: Laya.Quaternion = new Laya.Quaternion();
    protected tempRotationY: Laya.Quaternion = new Laya.Quaternion();
    protected isRightMouseDown: Boolean;
    protected isLeftMouseDown: Boolean;
    protected rotaionSpeed: number = 0.00006;
    protected camera: Laya.BaseCamera;
    protected scene: Laya.Scene3D;
    protected role3D: Laya.Sprite3D;
    protected camCube: Laya.Sprite3D;

    constructor() {
        super();

    }

    /**
     * @private
     */
    protected _updateRotation(): void {
        if (Math.abs(this.yawPitchRoll.y) < 1.50) {

            // 欧拉角生成四元数
            // https://en.wikipedia.org/wiki/Aircraft_principal_axes 偏航軸
            // Yew:y   Roll:z  Pitch:x
            Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
            // console.log("rotation   1", this.camera.transform.localRotation)
            this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
            // console.log("rotation   2", this.camera.transform.localRotation)

            // 不懂要这一步做啥...不是已经clone了么...
            this.camera.transform.localRotation = this.camera.transform.localRotation;


            // console.log("rotation   3", this.camera.transform.localRotation)
            let forward = new Vector3()
            this.camera.transform.getForward(forward)

            let scaleFactor = 10;
            let cubeDistance = new Vector3(forward.x * scaleFactor, 3, forward.y * scaleFactor)
            let cuePos = new Vector3()
            Vector3.add(this.camera.transform.position, cubeDistance, cuePos)

            this.camCube.transform.position = cuePos
            console.log("forward", forward, cuePos)
        }
    }

    /**
     * @inheritDoc
     */
    public onAwake(): void {
        Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.rightMouseDown);
        Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.rightMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.leftMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.leftMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.mouseOut);
        this.camera = this.owner as Laya.Camera;
        this.role3D = GameManager.Instance.role3D;
        this.lastRoleTransform = this.role3D.transform.position;

        this.camCube = GameManager.Instance.camCube;

    }

    /**
     * @inheritDoc
     */
    public onUpdate(): void {
        var elapsedTime: number = Laya.timer.delta;
        let role3D = this.role3D;
        if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isRightMouseDown) {
            var scene: Laya.Scene3D = this.owner.scene;
            Laya.KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime);//W
            Laya.KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime);//S
            Laya.KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime);//A
            Laya.KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime);//D
            Laya.KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime);//Q
            Laya.KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime);//E

            var offsetX: number = Laya.stage.mouseX - this.lastMouseX;
            var offsetY: number = Laya.stage.mouseY - this.lastMouseY;
            var yprElem: Laya.Vector3 = this.yawPitchRoll;
            yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
            yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
            // console.log("offset ", offsetX, offsetY, yprElem.x, yprElem.y)
            this._updateRotation();



        } else {
            // if (this.isLeftMouseDown) {
            let roleMoveVec = new Vector3(
                role3D.transform.position.x - this.lastRoleTransform.x,
                role3D.transform.position.y - this.lastRoleTransform.y,
                role3D.transform.position.z - this.lastRoleTransform.z,
            )
            this.camera.transform.position = new Vector3(
                this.camera.transform.position.x + roleMoveVec.x,
                this.camera.transform.position.y + roleMoveVec.y,
                this.camera.transform.position.z + roleMoveVec.z,
            )
            //lookAt(role3D.transform.position, new Laya.Vector3(0,1,0));
        }

        this.lastMouseX = Laya.stage.mouseX;
        this.lastMouseY = Laya.stage.mouseY;
        this.lastRoleTransform = new Vector3(role3D.transform.position.x, role3D.transform.position.y, role3D.transform.position.z);

    }

    /**
     * @inheritDoc
     */
    public onDestroy(): void {
        Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.rightMouseDown);
        Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.rightMouseUp);
    }

    protected rightMouseDown(e: Laya.Event): void {

        // 根据四元数得到欧拉角
        this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
        //如果e 是 Event 则应该这样获取到在stage上的位置 Laya.stage.mouseX;
        this.lastMouseX = e.stageX
        this.lastMouseY = e.stageY
        this.isRightMouseDown = true;
    }

    protected rightMouseUp(e: Event): void {
        this.isRightMouseDown = false;
    }

    protected leftMouseDown(e: Event): void {
        console.log("left")
        // this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);

        // this.lastMouseX = Laya.stage.mouseX;
        // this.lastMouseY = Laya.stage.mouseY;
        this.isLeftMouseDown = true;
    }

    protected leftMouseUp(e: Event): void {
        this.isLeftMouseDown = false;
    }

    protected mouseOut(e: Event): void {
        this.isRightMouseDown = false;
        this.isLeftMouseDown = false;
    }

    /**
     * 向前移动。
     * @param distance 移动距离。
     */
    public moveForward(distance: number): void {
        this._tempVector3.x = this._tempVector3.y = 0;
        this._tempVector3.z = distance;
        this.camera.transform.translate(this._tempVector3);
    }

    /**
     * 向右移动。
     * @param distance 移动距离。
     */
    public moveRight(distance: number): void {
        this._tempVector3.y = this._tempVector3.z = 0;
        this._tempVector3.x = distance;
        this.camera.transform.translate(this._tempVector3);
    }

    /**
     * 向上移动。
     * @param distance 移动距离。
     */
    public moveVertical(distance: number): void {
        this._tempVector3.x = this._tempVector3.z = 0;
        this._tempVector3.y = distance;
        this.camera.transform.translate(this._tempVector3, false);
    }
}
