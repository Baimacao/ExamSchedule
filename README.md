# ExamSchedule

**不只是考试看板。**

本仓库是 [ExamAware/ExamSchedule](https://github.com/ExamAware/ExamSchedule) 的静态部署挂载点，
用于在学校一体机 / 大屏上直接打开，不需要任何后端。

> 看板程序本身由 **ExamAware 开发团队**开发，本仓库只做静态托管与本地化调整。

- 🌐 在线访问：[https://es.examaware.tech](https://baimacao.github.io/ExamSchedule/)
- 📦 下载中心：<https://baimacao.github.io/ExamSchedule/download/>
- 🖥️ 客户端 ExamAware2：<https://github.com/ExamAware/ExamAware2/releases>
- 🚍本堂考试配置：<https://raw.githubusercontent.com/Baimacao/ExamSchedule/refs/heads/main/exam/exam_config.json>

---

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `index.html` | 入口页，选择「电子钟表 / 考试信息 / 下载中心」 |
| `exam/` | **考试看板 + 广播**：考试科目、时间、状态、提醒音 |
| `time/` | 电子钟表，可切换字体与字号 |
| `about/` | 关于页面、开源许可与字体版权说明 |
| `download/` | **下载中心**：ExamAware2 客户端各平台安装包 + 本仓库考试资源 |
| `assets/` | 全站共用的字体与图标样式、图标资源 |
| `_tools/` | 维护用脚本（字体切片生成、主题样式规整、GitHub API 取文件） |

## 快速开始

直接用任意静态服务器托管仓库根目录即可，例如：

```bash
python -m http.server 8080
# 然后访问 http://localhost:8080/
```

考试内容在 `exam/exam_config.json` 中配置：

```json
{
  "examName": "考试名称",
  "message": "看板底部提示语",
  "examInfos": [
    { "name": "语文", "start": "2026-09-28 09:00:00", "end": "2026-09-28 11:30:00", "alertTime": 15 }
  ]
}
```

## 本次优化要点

### 字体：全站改用 MiSans 并整体加粗

- 旧样式把字体写成 `'Roboto'` / `'HarmonyOS Sans SC Regular'`，这两个字体本项目都不分发，
  中文实际一直回退到浏览器默认 sans 字体。现在统一为
  `'MiSans' → 'HarmonyOS Sans SC' → 'PingFang SC' → 'Microsoft YaHei UI' → 'Noto Sans SC'`。
- 字重整体上移：正文 400 → 500，标题与强调 500 → 700。
  MiSans 最粗只到 **700 (Heavy)**，旧的 `font-weight: 900` 属于浏览器伪加粗，已归一到 700。
- 字体按 `unicode-range` 切片从**小米官方 CDN** 按需加载，仓库内不分发字体二进制。
  `assets/misans.css` 由脚本裁剪生成，只保留本站用得到的 5 片 × 3 字重（官方是 56 片 × 3 字重）。

  ```bash
  python _tools/build_font_subset.py --emit assets/misans.css
  ```

- MiSans 版权归小米科技有限责任公司所有，遵循
  [《MiSans 字体知识产权许可协议》](https://hyperos.mi.com/font/zh/)。

### 加载速度

| 项目 | 优化前 | 优化后 |
| --- | --- | --- |
| `exam/` 首屏音频下载量 | **约 52 MB**（8 个音频 × 2 份 `preload="auto"`） | **0**，改为播放/提醒到点前才加载 |
| 字体样式表 | Google Fonts Roboto 300–900 + 3 套图标字体 | MiSans 切片 CSS（约 12 KB）+ Material Symbols 1 套 |
| `time/` 字体请求 | 7 个在线字体族 | 0（改用 MiSans） |
| 入口页图标 | 276 KB PNG（显示 32px） | WebP 1.7 KB + PNG 回退 |
| 关于页 | 首屏拉取 35 KB LICENSE 全文 | 点击后按需加载 |

主要改动：

1. **音频按需加载**（`exam/Scripts/audioController.js`）：改为固定复用 3 个 `preload="none"` 的
   `<audio>` 元素，仅在真正播放或提醒到点前（`reminderQueue` 预热）才下载对应文件；
   旧实现会在初始化时为每个音频建 2 个 `preload="auto"` 元素，一次性拉满全部音频。
2. **图标字体收敛为一套**：删掉完全没有被使用的 Material Icons，只保留
   Material Symbols Outlined；主题里 `#…-btn::before { content: "fullscreen" }`
   这类规则也一并删除——它们靠图标字体的连字把单词变成图标，字体没加载时
   会把单词直接显示在按钮上，而且只有部分主题有，各主题表现不一致。
3. **移除无用字体请求**：入口页/关于页/钟表页不再拉取整套 Google Fonts。
4. **入口页按钮增加「下载中心」**，图片改为 WebP 并限定显示尺寸。

## 维护脚本

```bash
python _tools/build_font_subset.py --emit assets/misans.css   # 重新裁剪字体切片
python _tools/build_font_subset.py --check                   # 校验切片是否过期
python _tools/apply_theme_fonts.py                           # 规整 8 个主题样式（幂等）
python _tools/restore_paths.py <owner/repo> <ref> <dest> <path...>   # 经 API 还原单个文件
```

> 改动任何用户可见文案后，请重新运行 `build_font_subset.py --emit`，
> 否则新出现的汉字会回退到系统字体。

## 许可证

本项目采用 **GNU General Public License v3.0**（见 [LICENSE](LICENSE)）。
看板程序版权归 ExamAware 开发团队；MiSans 字体版权归小米科技有限责任公司；
图标字体为 Google Material Symbols。
