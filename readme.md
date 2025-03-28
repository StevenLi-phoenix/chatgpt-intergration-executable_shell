# ChatGPT LocalExecute Shell

## 项目简介

LocalExecute Shell 是一个基于 FastAPI 的应用程序，允许用户通过 HTTP 请求在本地执行 shell 命令。该项目还包含一个 Tampermonkey 脚本，用于在 ChatGPT 网站上为代码块添加“运行”按钮，方便用户直接执行代码并查看结果。

## 主要功能

- 通过 FastAPI 提供的 `/run/` 端点执行 shell 命令。
- 使用 Tampermonkey 脚本在 ChatGPT 网站上为代码块添加“运行”按钮。
- 支持多种 shell 语言（sh、bash、zsh、cmd、powershell）。
  
<img width="819" alt="Screenshot 2025-03-28 at 02 13 11" src="https://github.com/user-attachments/assets/ef61a9d3-ace7-46f4-a081-8eee06217477" />

  

## 安装步骤

### 先决条件

- Python 3.x
- Node.js 和 npm（用于安装 Tampermonkey）
- Tampermonkey 浏览器扩展

### 安装步骤

1. 克隆项目到本地：

   ```bash
   git clone <repository-url>
   cd localexecute-shell
   ```

2. 安装 Python 依赖：

   ```bash
   pip install -r requirements.txt
   ```

3. 运行 FastAPI 应用：

   ```bash
   uvicorn main:app --reload
   ```

4. 安装 Tampermonkey 脚本：

   - 打开浏览器并安装 Tampermonkey 扩展。
   - 创建一个新的用户脚本，将 `tempermonkey.js` 的内容复制粘贴进去并保存。

## 使用方法

- 启动 FastAPI 应用后，访问 `http://localhost:8080`。
- 在 ChatGPT 网站上，代码块将显示“运行”按钮，点击即可执行代码。
- 结果将显示在代码块下方，并可通过“→ Chat”按钮插入到 ChatGPT 输入框中。

## 注意事项

- 确保 `.env` 文件中包含正确的 `SECRET_KEY`，以便进行身份验证。
- 运行命令时，请确保命令的安全性，避免执行恶意代码。

## 贡献

欢迎贡献代码！请提交 Pull Request 或报告问题。

## 许可证

该项目采用 MIT 许可证。
