# 四面体上的数值积分演示

这是一个用于演示四面体上数值积分的交互式 Web 应用程序。该应用允许用户选择不同的积分公式，输入自定义函数，并在 3D 环境中可视化积分节点的分布。

## 功能特点

- 支持多种预设积分公式：
  - ORDER1POINT4 (4 个节点，代数精度为 1)
  - ORDER4POINT23 (23 个节点，代数精度为 4)
  - ORDER7POINT50_v1 (50 个节点，代数精度为 7)
  - ORDER7POINT50_v2 (50 个节点，代数精度为 7)
- 支持自定义积分公式
- 3D 可视化积分节点分布
- 实时计算积分结果
- 支持自定义四面体顶点坐标
- 支持自定义节点和边的颜色
- 支持保存 3D 图像

## 技术栈

- HTML5
- CSS3
- JavaScript
- Three.js (3D 渲染)
- MathJax (数学公式渲染)

## 本地运行

1. 克隆仓库：

    ```bash
    git clone https://github.com/yourusername/tetrahedron_integral_demo.git
    cd tetrahedron_integral_demo
    ```

2. 使用任意 HTTP 服务器运行项目，例如：

    ```bash
    # 使用Python的简易HTTP服务器
    python -m http.server 8000

    # 或使用Node.js的http-server
    npx http-server
    ```

3. 在浏览器中访问 `http://localhost:8000`

## 部署到 Vercel

本项目可以轻松部署到 Vercel 平台。以下是部署步骤：

1. 确保你有一个 Vercel 账号（如果没有，请在 [Vercel 官网](https://vercel.com) 注册）

2. 安装 Vercel CLI（可选）：

    ```bash
    npm install -g vercel
    ```

3. 在项目根目录下运行：

    ```bash
    vercel
    ```

4. 按照提示完成部署：

   - 登录你的 Vercel 账号
   - 选择要部署的项目
   - 确认部署设置

5. 部署完成后，Vercel 会提供一个可访问的 URL

### 自动部署

你也可以通过以下步骤设置自动部署：

1. 将代码推送到 GitHub 仓库

2. 在 Vercel 中导入该仓库：

   - 登录 Vercel
   - 点击"New Project"
   - 选择你的 GitHub 仓库
   - 点击"Import"

3. 配置部署设置：

   - Framework Preset: 选择"Other"
   - Build Command: 留空
   - Output Directory: 留空
   - Install Command: 留空

4. 点击"Deploy"

之后，每次你推送代码到主分支，Vercel 都会自动重新部署你的应用。

## 使用说明

1. 选择积分公式：

   - 从下拉菜单中选择预设公式
   - 或选择"自定义"并输入自定义公式

2. 输入要积分的函数：

   - 使用 TeX 语法输入函数表达式
   - 例如：`x^2 + y^2 + z^2`

3. 设置四面体顶点坐标（可选）：

   - 默认使用单位四面体
   - 可以自定义四个顶点的坐标

4. 点击"开始计算"获取积分结果

5. 使用"绘制节点分布"按钮查看 3D 可视化结果

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件
