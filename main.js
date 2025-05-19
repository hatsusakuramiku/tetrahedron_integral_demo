/**
 * 四面体上的数值积分演示demo - 主逻辑
 * 处理页面交互和功能协调
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const formulaSelector = document.getElementById('formula-selector');
    const functionExpression = document.getElementById('function-expression');
    const formulaDescription = document.getElementById('formula-description');
    const customFormulaSection = document.getElementById('custom-formula-section');
    const customFormulaName = document.getElementById('custom-formula-name');
    const customFormulaData = document.getElementById('custom-formula-data');
    const calculationResult = document.getElementById('calculation-result');
    const calculateBtn = document.getElementById('calculate-btn');
    const nodeColor = document.getElementById('node-color');
    const edgeColor = document.getElementById('edge-color');
    const fillColor = document.getElementById('fill-color');
    const saveImageBtn = document.getElementById('save-image-btn');
    const drawBtn = document.getElementById('draw-btn');
    const resetBtn = document.getElementById('reset-btn');
    const vertexInputs = [
        document.getElementById('vertex1'),
        document.getElementById('vertex2'),
        document.getElementById('vertex3'),
        document.getElementById('vertex4')
    ];
    
    // 初始化积分公式选择器
    initFormulaSelector();
    
    // 初始化事件监听
    formulaSelector.addEventListener('change', handleFormulaChange);
    calculateBtn.addEventListener('click', handleCalculate);
    drawBtn.addEventListener('click', handleDraw);
    saveImageBtn.addEventListener('click', handleSaveImage);
    resetBtn.addEventListener('click', handleReset);
    
    // 初始化页面状态
    handleFormulaChange();
    
    /**
     * 初始化积分公式选择器
     */
    function initFormulaSelector() {
        // 清空现有选项
        formulaSelector.innerHTML = '';
        
        // 添加预定义公式选项
        getFormulaNames().forEach(name => {
            if (name !== 'custom') {
                const formula = getFormula(name);
                const option = document.createElement('option');
                option.value = name;
                option.textContent = `${name} (${formula.description})`;
                formulaSelector.appendChild(option);
            }
        });
        
        // 添加自定义选项
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '自定义';
        formulaSelector.appendChild(customOption);
    }
    
    /**
     * 处理积分公式选择变化
     */
    function handleFormulaChange() {
        const selectedFormula = formulaSelector.value;
        
        // 显示或隐藏自定义公式区域
        if (selectedFormula === 'custom') {
            customFormulaSection.classList.remove('hidden');
            formulaDescription.textContent = '请在下方输入自定义积分公式的节点及权重';
        } else {
            customFormulaSection.classList.add('hidden');
            const formula = getFormula(selectedFormula);
            if (formula) {
                formulaDescription.textContent = formula.description;
            } else {
                formulaDescription.textContent = '未找到公式描述';
            }
        }
    }
    
    /**
     * 处理开始计算按钮点击
     */
    function handleCalculate() {
        try {
            // 清空之前的结果
            calculationResult.innerHTML = '';
            
            // 获取函数表达式
            const funcExpr = functionExpression.value.trim();
            if (!funcExpr) {
                throw new Error('请输入函数表达式');
            }
            
            // 获取积分公式数据
            let formulaData;
            if (formulaSelector.value === 'custom') {
                // 解析自定义公式数据
                try {
                    const customData = parseCustomFormulaData(customFormulaData.value);
                    const validation = validateCustomFormula(customData);
                    
                    if (!validation.valid) {
                        throw new Error(validation.error);
                    }
                    
                    if (validation.warning) {
                        calculationResult.innerHTML += `<p style="color: orange;">警告: ${validation.warning}</p>`;
                    }
                    
                    formulaData = customData;
                } catch (e) {
                    throw new Error(`自定义公式数据格式错误: ${e.message}`);
                }
            } else {
                const formula = getFormula(formulaSelector.value);
                if (!formula) {
                    throw new Error('未找到选定的积分公式');
                }
                formulaData = formula.data;
            }
            
            // 获取四面体顶点坐标
            const vertices = [];
            for (let i = 0; i < 4; i++) {
                try {
                    vertices.push(parseCoordinates(vertexInputs[i].value));
                } catch (e) {
                    throw new Error(`第 ${i+1} 个顶点坐标格式错误: ${e.message}`);
                }
            }
            
            // 计算积分结果
            const result = calculateIntegral(funcExpr, formulaData, vertices);
            
            // 显示结果
            calculationResult.innerHTML += `<p>积分结果: ${result.toFixed(8)}</p>`;
            
            // 更新绘图
            updateRenderer(formulaData, vertices);
            
            // 启用保存图片按钮
            saveImageBtn.disabled = false;
            
        } catch (error) {
            calculationResult.innerHTML = `<p style="color: red;">错误: ${error.message}</p>`;
        }
    }
    
    /**
     * 处理绘制按钮点击
     */
    function handleDraw() {
        try {
            // 获取四面体顶点坐标
            const vertices = [];
            for (let i = 0; i < 4; i++) {
                try {
                    vertices.push(parseCoordinates(vertexInputs[i].value));
                } catch (e) {
                    throw new Error(`第 ${i+1} 个顶点坐标格式错误: ${e.message}`);
                }
            }
            
            // 获取积分公式数据
            let formulaData;
            if (formulaSelector.value === 'custom') {
                // 解析自定义公式数据
                try {
                    formulaData = parseCustomFormulaData(customFormulaData.value);
                    const validation = validateCustomFormula(formulaData);
                    
                    if (!validation.valid) {
                        throw new Error(validation.error);
                    }
                } catch (e) {
                    throw new Error(`自定义公式数据格式错误: ${e.message}`);
                }
            } else {
                const formula = getFormula(formulaSelector.value);
                if (!formula) {
                    throw new Error('未找到选定的积分公式');
                }
                formulaData = formula.data;
            }
            
            // 更新绘图
            updateRenderer(formulaData, vertices, {
                nodeColor: nodeColor.value,
                edgeColor: edgeColor.value,
                fillColor: fillColor.value
            });
            
            // 启用保存图片按钮
            saveImageBtn.disabled = false;
            
        } catch (error) {
            calculationResult.innerHTML = `<p style="color: red;">错误: ${error.message}</p>`;
        }
    }
    
    /**
     * 处理保存图片按钮点击
     */
    function handleSaveImage() {
        try {
            saveRendererImage();
        } catch (error) {
            calculationResult.innerHTML = `<p style="color: red;">保存图片失败: ${error.message}</p>`;
        }
    }
    
    /**
     * 处理重置按钮点击
     */
    function handleReset() {
        // 重置表单
        formulaSelector.selectedIndex = 0;
        functionExpression.value = '';
        customFormulaName.value = '';
        customFormulaData.value = '';
        nodeColor.value = 'red';
        edgeColor.value = 'black';
        fillColor.value = 'rgba(0,0,255,0.2)';
        
        // 重置顶点坐标
        vertexInputs[0].value = '0,0,0';
        vertexInputs[1].value = '1,0,0';
        vertexInputs[2].value = '0,1,0';
        vertexInputs[3].value = '0,0,1';
        
        // 清空结果
        calculationResult.innerHTML = '';
        formulaDescription.textContent = getFormula(formulaSelector.value).description;
        
        // 隐藏自定义公式区域
        customFormulaSection.classList.add('hidden');
        
        // 禁用保存图片按钮
        saveImageBtn.disabled = true;
        
        // 重置绘图
        resetRenderer();
    }
    
    /**
     * 解析坐标字符串
     * @param {string} coordStr - 坐标字符串，格式为 "x,y,z"
     * @returns {Array} 坐标数组 [x, y, z]
     */
    function parseCoordinates(coordStr) {
        const coords = coordStr.split(',').map(c => parseFloat(c.trim()));
        
        if (coords.length !== 3 || coords.some(c => isNaN(c))) {
            throw new Error('坐标格式应为 "x,y,z"，例如 "0,0,0"');
        }
        
        return coords;
    }
    
    /**
     * 解析自定义公式数据
     * @param {string} dataStr - 自定义公式数据字符串
     * @returns {Array} 解析后的数据数组
     */
    function parseCustomFormulaData(dataStr) {
        // 尝试解析为JavaScript数组格式
        try {
            // 安全地解析JSON或JavaScript数组
            const cleanedStr = dataStr.replace(/'/g, '"')  // 将单引号替换为双引号
                                      .replace(/\s+/g, ' ') // 规范化空白字符
                                      .trim();
            
            // 检查是否是Python风格的数组
            if (cleanedStr.includes('[[') && cleanedStr.includes(']]')) {
                // 将Python风格的数组转换为JSON格式
                const jsonStr = cleanedStr.replace(/\[\s*\[/g, '[[')
                                         .replace(/\]\s*\]/g, ']]')
                                         .replace(/\],\s*\[/g, '],[');
                return JSON.parse(jsonStr);
            } else {
                // 尝试直接解析为JSON
                return JSON.parse(cleanedStr);
            }
        } catch (e) {
            // 如果JSON解析失败，尝试作为JavaScript代码执行
            try {
                // 注意：这种方法在实际生产环境中可能存在安全风险
                // 仅用于演示目的
                const sanitizedStr = dataStr.replace(/[^0-9,.\[\]\s]/g, ''); // 只保留数字、逗号、点、方括号和空白
                return eval(`(${sanitizedStr})`);
            } catch (e2) {
                throw new Error('无法解析数据格式，请确保使用有效的JSON或JavaScript数组格式');
            }
        }
    }
});
