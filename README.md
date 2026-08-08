# AI 小说创作助手

一个用 [Express](https://expressjs.com/) 编写的小型 Web 应用,用来**借助 AI 写小说 / 续写小说**。
配置了 `OPENAI_API_KEY` 时调用真实的大语言模型生成正文;没有密钥时自动进入
**演示(demo)模式**,用本地占位文本,保证应用与开发环境始终可以端到端跑通。

## 环境要求

- Node.js >= 20(基于 Node 22 开发)

## 快速开始

```bash
npm ci        # 安装依赖
npm run dev   # 启动开发服务器(自动重载),访问 http://localhost:3000
```

打开 http://localhost:3000,填写标题 / 题材 / 人物 / 梗概 / 写作要求,点击「生成续写」。

## 启用真实 AI 生成

设置以下环境变量(在 Cursor 中建议以 **Secret** 形式配置 `OPENAI_API_KEY`):

| 环境变量          | 默认值                        | 说明                                       |
| ----------------- | ----------------------------- | ------------------------------------------ |
| `OPENAI_API_KEY`  | 无                            | 设置后启用真实 AI 生成;不设置则为演示模式 |
| `OPENAI_MODEL`    | `gpt-4o-mini`                 | 使用的模型名                               |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1`   | 兼容 OpenAI 协议的接口地址(可指向其他服务)|

## 脚本

| 命令          | 说明                                          |
| ------------- | --------------------------------------------- |
| `npm start`   | 启动服务器(`src/server.js`)。                |
| `npm run dev` | 以 `node --watch` 自动重载方式启动。          |
| `npm test`    | 运行自动化测试(`node --test`)。             |

## HTTP 接口

| 方法与路径          | 说明                                                            |
| ------------------- | -------------------------------------------------------------- |
| `GET /`             | 小说创作页面(静态 HTML)。                                     |
| `GET /api/config`   | 返回当前是否已配置 AI(`aiConfigured`)及模型名。               |
| `POST /api/generate`| 生成 / 续写小说正文。请求体:`title, genre, characters, outline, instruction, previousText`。 |
| `GET /healthz`      | 健康检查,返回 `{ "status": "ok" }`。                          |

## 服务器配置

| 环境变量 | 默认值    | 说明               |
| -------- | --------- | ------------------ |
| `PORT`   | `3000`    | 服务监听端口。     |
| `HOST`   | `0.0.0.0` | 服务监听地址。     |

## Cloud Agent 开发环境

Cursor Cloud Agent 环境定义在
[`.cursor/environment.json`](.cursor/environment.json):

- `install`: `npm ci`,依据 lockfile 安装依赖。
- `terminals.dev-server`: 运行 `npm run dev`,让开发服务器常驻且日志可见。
