/**
 * 四面体上的数值积分演示demo - 3D渲染器
 * 负责四面体和积分节点的3D绘制与交互
 */

// 渲染器全局变量
let renderer, scene, camera, controls;
let tetrahedron, nodes;
let isInitialized = false;

/**
 * 初始化3D渲染器
 */
function initRenderer() {
    const container = document.getElementById('canvas-container');
    
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // 创建相机
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(1.5, 1.5, 1.5);
    camera.lookAt(0.25, 0.25, 0.25);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    
    // 清除容器中的旧内容
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // 添加渲染器到容器
    container.appendChild(renderer.domElement);
    
    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxDistance = 10;
    controls.target.set(0.25, 0.25, 0.25);
    
    // 添加坐标轴辅助
    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);
    
    // 添加环境光和方向光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 标记为已初始化
    isInitialized = true;
    
    // 开始动画循环
    animate();
}

/**
 * 动画循环
 */
function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

/**
 * 创建四面体
 * @param {Array} vertices - 四个顶点坐标数组
 * @param {Object} options - 渲染选项
 */
function createTetrahedron(vertices, options = {}) {
    // 默认选项
    const defaultOptions = {
        edgeColor: 'black',
        fillColor: 'rgba(0,0,255,0.2)'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // 移除旧的四面体
    if (tetrahedron) {
        scene.remove(tetrahedron);
    }
    
    // 创建四面体组
    tetrahedron = new THREE.Group();
    
    // 创建四面体的四个面
    const faces = [
        [0, 1, 2], // 底面
        [0, 1, 3], // 侧面1
        [1, 2, 3], // 侧面2
        [0, 2, 3]  // 侧面3
    ];
    
    // 解析填充颜色
    let fillMaterial;
    if (opts.fillColor.startsWith('rgba')) {
        // 解析RGBA格式
        const rgba = opts.fillColor.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/);
        if (rgba) {
            const r = parseInt(rgba[1]) / 255;
            const g = parseInt(rgba[2]) / 255;
            const b = parseInt(rgba[3]) / 255;
            const a = parseFloat(rgba[4]);
            
            fillMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(r, g, b),
                transparent: true,
                opacity: a,
                side: THREE.DoubleSide
            });
        }
    }
    
    // 如果无法解析RGBA，使用默认颜色
    if (!fillMaterial) {
        fillMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(opts.fillColor),
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
    }
    
    // 创建边的材质
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(opts.edgeColor),
        linewidth: 2
    });
    
    // 为每个面创建网格和边
    faces.forEach(face => {
        // 创建面的几何体
        const geometry = new THREE.BufferGeometry();
        
        // 设置顶点
        const positions = [];
        face.forEach(index => {
            positions.push(...vertices[index]);
        });
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();
        
        // 创建面的网格
        const mesh = new THREE.Mesh(geometry, fillMaterial);
        tetrahedron.add(mesh);
        
        // 创建面的边
        const edgeGeometry = new THREE.BufferGeometry();
        const edgePositions = [
            ...vertices[face[0]], ...vertices[face[1]],
            ...vertices[face[1]], ...vertices[face[2]],
            ...vertices[face[2]], ...vertices[face[0]]
        ];
        
        edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        tetrahedron.add(edges);
    });
    
    // 添加四面体到场景
    scene.add(tetrahedron);
}

/**
 * 创建积分节点
 * @param {Array} formulaData - 积分公式数据
 * @param {Array} vertices - 四个顶点坐标数组
 * @param {Object} options - 渲染选项
 */
function createNodes(formulaData, vertices, options = {}) {
    // 默认选项
    const defaultOptions = {
        nodeColor: 'red'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // 移除旧的节点
    if (nodes) {
        scene.remove(nodes);
    }
    
    // 创建节点组
    nodes = new THREE.Group();
    
    // 创建节点材质
    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(opts.nodeColor)
    });
    
    // 计算节点的实际坐标
    formulaData.forEach(node => {
        const [a, b, c, weight] = node;
        
        // 使用重心坐标计算实际位置
        // P = (1-a-b-c)*V1 + a*V2 + b*V3 + c*V4
        const x = (1 - a - b - c) * vertices[0][0] + a * vertices[1][0] + b * vertices[2][0] + c * vertices[3][0];
        const y = (1 - a - b - c) * vertices[0][1] + a * vertices[1][1] + b * vertices[2][1] + c * vertices[3][1];
        const z = (1 - a - b - c) * vertices[0][2] + a * vertices[1][2] + b * vertices[2][2] + c * vertices[3][2];
        
        // 根据权重调整节点大小
        const size = Math.max(0.01, Math.min(0.05, weight * 10));
        
        // 创建节点几何体
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const sphere = new THREE.Mesh(geometry, nodeMaterial);
        
        // 设置节点位置
        sphere.position.set(x, y, z);
        
        // 添加到节点组
        nodes.add(sphere);
    });
    
    // 添加节点组到场景
    scene.add(nodes);
}

/**
 * 更新渲染器
 * @param {Array} formulaData - 积分公式数据
 * @param {Array} vertices - 四个顶点坐标数组
 * @param {Object} options - 渲染选项
 */
function updateRenderer(formulaData, vertices, options = {}) {
    // 如果渲染器未初始化，先初始化
    if (!isInitialized) {
        initRenderer();
    }
    
    // 创建四面体
    createTetrahedron(vertices, options);
    
    // 创建积分节点
    createNodes(formulaData, vertices, options);
    
    // 更新控制器目标点为四面体中心
    const centerX = (vertices[0][0] + vertices[1][0] + vertices[2][0] + vertices[3][0]) / 4;
    const centerY = (vertices[0][1] + vertices[1][1] + vertices[2][1] + vertices[3][1]) / 4;
    const centerZ = (vertices[0][2] + vertices[1][2] + vertices[2][2] + vertices[3][2]) / 4;
    
    controls.target.set(centerX, centerY, centerZ);
    controls.update();
}

/**
 * 重置渲染器
 */
function resetRenderer() {
    // 如果渲染器未初始化，不执行任何操作
    if (!isInitialized) {
        return;
    }
    
    // 移除四面体和节点
    if (tetrahedron) {
        scene.remove(tetrahedron);
        tetrahedron = null;
    }
    
    if (nodes) {
        scene.remove(nodes);
        nodes = null;
    }
    
    // 重置相机位置和控制器
    camera.position.set(1.5, 1.5, 1.5);
    controls.target.set(0.25, 0.25, 0.25);
    controls.update();
}

/**
 * 保存渲染器图片
 */
function saveRendererImage() {
    // 如果渲染器未初始化，不执行任何操作
    if (!isInitialized) {
        throw new Error('渲染器未初始化，无法保存图片');
    }
    
    // 渲染一帧以确保图像是最新的
    renderer.render(scene, camera);
    
    // 获取图像数据URL
    const dataURL = renderer.domElement.toDataURL('image/png');
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'tetrahedron_integration.png';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
