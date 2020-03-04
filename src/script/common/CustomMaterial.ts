export default class CustomMaterial extends Laya.BaseMaterial {
    public static DIFFUSETEXTURE: number =  Laya.Shader3D.propertyNameToID("u_texture");
    public static MARGINALCOLOR: number = Laya.Shader3D.propertyNameToID("u_marginalColor");
    constructor() {
        super();
        this.initShader()
        this.setShaderName("CMatShader");
    }
    /**
     * 获取漫反射贴图。
     *  漫反射贴图。
     */
    public get diffuseTexture(): Laya.BaseTexture {
        return this._shaderValues.getTexture(CustomMaterial.DIFFUSETEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * 漫反射贴图。
     */
    public set diffuseTexture(value: Laya.BaseTexture) {
        this._shaderValues.setTexture(CustomMaterial.DIFFUSETEXTURE,value);
    }

    /**
     * 设置边缘光照颜色。
     * 边缘光照颜色。
     */
    public set marginalColor(value: Laya.Vector3) {
        this._shaderValues.setVector3(CustomMaterial.MARGINALCOLOR, value);
    }

    private  initShader() {
        var attributeMap: Object = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
            'a_Texcood0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0
        };
        var uniformMap: Object = {
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
            'u_MainTex': Laya.Shader3D.PERIOD_MATERIAL,
            'u_MainCol': Laya.Shader3D.PERIOD_MATERIAL
        };
        var vs: string = `
        #include "Lighting.glsl"; 
        attribute vec4 a_Position;
        attribute vec3 a_Normal;
        attribute vec2 a_Texcood0;

        uniform mat4 u_MvpMatrix;
        uniform mat4 u_WorldMat;

        varying vec3 v_Normal;
        varying vec2 uv;
        varying vec4 worldPos;

        void main()
        {
            gl_Position = u_MvpMatrix * a_Position;
            mat3 worldMat = mat3(u_WorldMat);
            v_Normal = worldMat * a_Normal;
            worldPos = u_WorldMat * a_Position;
            uv = a_Texcood0;
            gl_Position = remapGLPositionZ(gl_Position); 
        }`;
        var ps: string = `
        #ifdef FSHIGHPRECISION
        precision highp float;
        #else
        precision mediump float;
        #endif

        uniform sampler2D u_MainTex;
        uniform vec3 u_MainCol;

        varying vec3 v_Normal;
        varying vec2 uv;
        varying vec4 worldPos;

        void main()
        {
            vec4 col = texture2D(u_MainTex, uv);
            //gl_FragColor = vec4(worldPos.xyz, 1.0);
            float d = distance(worldPos.xyz, vec3(.0, .0, .0)) * 0.15;
            col.xyz *= d;
            col.xyz *= u_MainCol;
            col.a = 0.5;
            gl_FragColor = col;
        }`;

        var customShader: Laya.Shader3D = Laya.Shader3D.add("CMatShader");
        var subShader: Laya.SubShader = new Laya.SubShader(attributeMap, uniformMap);
        customShader.addSubShader(subShader);
        subShader.addShaderPass(vs, ps);
    }    
}