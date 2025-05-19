/**
 * 四面体上的数值积分演示demo - 计算器
 * 负责函数表达式解析和积分计算
 */

/**
 * 计算四面体上的数值积分
 * @param {string} funcExpr - 函数表达式（TeX格式）
 * @param {Array} formulaData - 积分公式数据
 * @param {Array} vertices - 四个顶点坐标数组
 * @returns {number} 积分结果
 */
function calculateIntegral(funcExpr, formulaData, vertices) {
    // 解析函数表达式
    const func = parseFunctionExpression(funcExpr);
    
    // 计算四面体体积
    const volume = calculateTetrahedronVolume(vertices);
    
    // 计算积分
    let result = 0;
    
    formulaData.forEach(node => {
        const [a, b, c, weight] = node;
        
        // 使用重心坐标计算实际位置
        // P = (1-a-b-c)*V1 + a*V2 + b*V3 + c*V4
        const x = (1 - a - b - c) * vertices[0][0] + a * vertices[1][0] + b * vertices[2][0] + c * vertices[3][0];
        const y = (1 - a - b - c) * vertices[0][1] + a * vertices[1][1] + b * vertices[2][1] + c * vertices[3][1];
        const z = (1 - a - b - c) * vertices[0][2] + a * vertices[1][2] + b * vertices[2][2] + c * vertices[3][2];
        
        // 计算函数在该点的值
        const functionValue = func(x, y, z);
        
        // 累加积分值
        result += functionValue * weight * volume * 6; // 乘以6是因为标准四面体体积为1/6
    });
    
    return result;
}

/**
 * 解析函数表达式
 * @param {string} texExpr - TeX格式的函数表达式
 * @returns {Function} 返回一个接受(x,y,z)参数的函数
 */
function parseFunctionExpression(texExpr) {
    // 清理TeX表达式，转换为JavaScript可执行的表达式
    let jsExpr = texExpr;
    
    // 替换常见的TeX数学函数和符号
    const replacements = [
        { pattern: /\\sin/g, replacement: 'Math.sin' },
        { pattern: /\\cos/g, replacement: 'Math.cos' },
        { pattern: /\\tan/g, replacement: 'Math.tan' },
        { pattern: /\\exp/g, replacement: 'Math.exp' },
        { pattern: /\\log/g, replacement: 'Math.log' },
        { pattern: /\\ln/g, replacement: 'Math.log' },
        { pattern: /\\sqrt/g, replacement: 'Math.sqrt' },
        { pattern: /\\pi/g, replacement: 'Math.PI' },
        { pattern: /\\cdot/g, replacement: '*' },
        { pattern: /\\times/g, replacement: '*' },
        { pattern: /\\div/g, replacement: '/' },
        { pattern: /\^/g, replacement: '**' },
        { pattern: /\\frac\{([^{}]+)\}\{([^{}]+)\}/g, replacement: '($1)/($2)' },
        { pattern: /\\left\(/g, replacement: '(' },
        { pattern: /\\right\)/g, replacement: ')' },
        { pattern: /\\left\[/g, replacement: '[' },
        { pattern: /\\right\]/g, replacement: ']' },
        { pattern: /\\left\{/g, replacement: '{' },
        { pattern: /\\right\}/g, replacement: '}' }
    ];
    
    // 应用替换
    replacements.forEach(({ pattern, replacement }) => {
        jsExpr = jsExpr.replace(pattern, replacement);
    });
    
    // 移除所有剩余的TeX命令
    jsExpr = jsExpr.replace(/\\\w+/g, '');
    
    // 移除所有花括号
    jsExpr = jsExpr.replace(/[\{\}]/g, '');
    
    // 确保乘法运算符存在
    jsExpr = jsExpr.replace(/(\d+)([xyz])/g, '$1*$2');
    jsExpr = jsExpr.replace(/([xyz])(\d+)/g, '$1*$2');
    jsExpr = jsExpr.replace(/([xyz])([xyz])/g, '$1*$2');
    
    // 创建函数
    try {
        // 使用Function构造函数创建函数
        // 注意：在生产环境中，这种方法可能存在安全风险
        return new Function('x', 'y', 'z', `
            try {
                return ${jsExpr};
            } catch (e) {
                console.error("函数计算错误:", e);
                return NaN;
            }
        `);
    } catch (e) {
        throw new Error(`函数表达式解析错误: ${e.message}`);
    }
}

/**
 * 计算四面体体积
 * @param {Array} vertices - 四个顶点坐标数组
 * @returns {number} 四面体体积
 */
function calculateTetrahedronVolume(vertices) {
    // 提取顶点坐标
    const [v1, v2, v3, v4] = vertices;
    
    // 计算向量
    const a = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const b = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    const c = [v4[0] - v1[0], v4[1] - v1[1], v4[2] - v1[2]];
    
    // 计算混合积 (a × b) · c
    const crossX = a[1] * b[2] - a[2] * b[1];
    const crossY = a[2] * b[0] - a[0] * b[2];
    const crossZ = a[0] * b[1] - a[1] * b[0];
    
    const volume = Math.abs(crossX * c[0] + crossY * c[1] + crossZ * c[2]) / 6;
    
    return volume;
}
