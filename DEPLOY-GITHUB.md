# 将 DADA 作品集部署到 GitHub Pages

当前版本：淡蓝色主题、个人 Logo、微信二维码悬浮预览和最新作品名称。

## 使用哪个压缩包

- **DADA-GitHub-Pages.zip（推荐）**：源码、图片、字体和自动发布流程。以后更新作品时，GitHub 会重新构建并发布。
- **DADA-static-site.zip**：已经生成好的网站文件，适合直接发布静态网站，不需要在 GitHub 上安装依赖或构建。

GitHub 不会自动解压 ZIP。先在电脑上解压，再上传解压后的文件和文件夹。

## 推荐方式：自动发布

1. 在 GitHub 创建一个 Public 仓库，名称可以是 `dada-portfolio` 或其他名字。创建时勾选添加 README，让仓库拥有 `main` 分支。
2. 打开仓库 **Settings → Pages**，将 **Build and deployment → Source** 设置为 **GitHub Actions**。
3. 解压 **DADA-GitHub-Pages.zip**。在仓库的 **Code → Add file → Upload files** 中上传解压后的全部内容，然后提交到 `main` 分支。已有 README 可以用包里的版本替换。
4. 检查仓库根目录直接包含 `package.json`、`src`、`public` 和 `.github`。不要把外层文件夹或 ZIP 文件本身上传。自动发布文件必须位于 `.github/workflows/deploy-pages.yml`。
5. 打开 **Actions**，等待 **Deploy portfolio to GitHub Pages** 的 `build` 和 `deploy` 都显示绿色成功状态。
6. 回到 **Settings → Pages**，点击显示的网站链接。普通仓库的网址形式为 `https://你的用户名.github.io/仓库名/`。

流程支持 `main`、`master` 分支，也支持在 Actions 中手动点击 **Run workflow**。不需要额外填写 Token、API 密钥或服务器配置。自动发布和 Pages 来源的设置遵循 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 如果只想上传现成网页

使用 **DADA-static-site.zip**，解压后把里面的 `index.html`、`assets`、`images`、`fonts`、`logo.svg` 和 `.nojekyll` 等所有内容直接上传到一个仓库根目录。然后在 **Settings → Pages** 中选择 **Deploy from a branch**，分支选择 `main`，目录选择 `/(root)`。

这条方式使用已经生成好的页面；以后修改源码后需要重新构建、打包并替换静态文件。推荐方式与静态方式选择其中一种即可。

## 后续更新

- 修改介绍、品牌和联系方式：`src/profile.js`。
- 修改项目名称与分类：`src/projects.json`。
- 图片和二维码：`public/images/`。
- Logo 和标签页图标：`public/logo.svg`。
- 调整版式和配色：`src/styles.css`。

推荐方式下，将修改提交到 `main` 后会自动发布。当前资源路径已适配仓库子目录，不需要根据仓库名改配置；也适用于 `用户名.github.io` 仓库或自定义域名。相对路径处理采用 [Vite 官方的 relative base 配置](https://vite.dev/guide/build#relative-base)。

## 本地预览与重新打包

使用 Node.js 24。在项目文件夹里运行：

```powershell
npm ci
npm run dev
```

预览地址为 `http://127.0.0.1:5173/`。正式构建和本地预览：

```powershell
npm run build
npm run preview
```

构建后的文件在 `dist`，预览地址为 `http://127.0.0.1:4173/`。不要直接双击 HTML 预览 React 网站。

重新生成两个 ZIP：

```powershell
powershell -File scripts/package-release.ps1
```

ZIP 会保存在项目内的 `releases` 文件夹。包内已经包含处理好的图像，安装和构建不依赖原始作品集文件夹，也不需要 Python。

## 遇到问题时

- **首次 Actions 失败**：先确认 Pages 的 Source 已选择 GitHub Actions，再手动运行工作流。
- **没有自动发布流程**：检查 `.github/workflows/deploy-pages.yml` 是否上传到了正确位置。
- **出现 README 而没有网页**：检查是否选错发布方式，或把网站套在了额外的一层文件夹里。
- **网址 404**：查看 Actions 是否成功，以 Settings → Pages 中显示的链接为准。
