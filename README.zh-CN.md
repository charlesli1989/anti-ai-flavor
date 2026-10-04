# anti-ai-flavor

<!-- languages:start -->
[English](README.md) · **简体中文**
<!-- languages:end -->

[Covel](https://github.com/ackness/covel) 社区插件，去除叙事正文的"AI 腔"：向 story runtime 的 system prompt 注入按会话语言选择的文风约束——中文表（说明文腔、AI 高频陈词、活人感）和英文表（公式化结构、AI 高频陈词）。纯预防，不检查生成结果。

## 安装

- **GitHub 安装**：设置 → 插件 → 安装与管理，粘贴 `https://github.com/charlesli1989/anti-ai-flavor`，确认风险提示后安装，重启后端。
- **ZIP 导入**：从 [Releases](https://github.com/charlesli1989/anti-ai-flavor/releases) 下载 `anti-ai-flavor.zip`，在同一设置页拖入。
- **手动**：把本目录复制到 `~/.covel/plugins/anti-ai-flavor`，重启后端。

重启后在会话中启用插件，并按提示批准其服务端代码。

**支持的 Covel 版本**：≥ 0.0.46。

## 配置

每条规则在 设置 → 插件 → anti-ai-flavor 下有独立开关（共 15 个）。关闭的条目从注入文本中剔除，剩余条目重新连续编号。只存在于某一种语言规则表的条目，在另一种语言的会话里不生效，其说明中已标注适用范围。

## 数据、网络与成本行为

- **数据**：不读不写。不访问 plugin-data，不访问 store。
- **网络**：不发起任何网络请求。
- **模型成本**：自身不调用 LLM；只向 story runtime 现有的 system prompt 追加一段约 1 KB 的规则文本，每回合一次。

## 运行时结构

- `PLUGIN.md`：插件清单和 15 个按条目的 `userSettings` 开关声明。
- `server/index.js`：注册 `PostContextAssembly` hook 的入口。
- `hooks/inject-style-rules.js`：hook 实现，按 `payload.locale` 分流（zh/en），只改写 `outputKind === "story"` 的 runtime。
- `hooks/_style-rules.js`：中英文两张规则表和注入文本组装，纯文本常量，无运行时状态。

## 已知限制

- 只有中文和英文会话会注入规则，其他语言保持不变。
- prompt 侧预防无法保证模型百分之百遵守。

## 开发

需要 Node 26+ 和 pnpm。运行测试：

```sh
pnpm install
pnpm test
```

## 联系

问题与反馈：[GitHub Issues](https://github.com/charlesli1989/anti-ai-flavor/issues)。

## 许可证

[MIT](LICENSE)
