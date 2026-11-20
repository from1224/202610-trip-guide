# 杭州活动页维护

数据在 data.json。status：active 已核本周；pending 待核海报线索；permanent 长期候选；archived 历史活动。

每项保留 id、kind、area、title、venue、price、booking、checkedAt、sources；限时项填 dateStart/dateEnd。pending 还须 sourceNoteId、imagePage、itemIndex，并写明未独立验证。不得将海报标价或候选称为官方核实、可购、已预约或用户选择。

更新后运行 `node hangzhou/test-data.cjs` 与 `node hangzhou/test-delivery-contract.cjs`。交付通用的公开边界、线上与手机验收规则见 [../DELIVERY_ACCEPTANCE.md](../DELIVERY_ACCEPTANCE.md)；本页的字段约束仍以本文件和测试为准。推送后检查公开页与 `/hangzhou/data.json`。localStorage 键 `hz:<id>`，勿改既有 id。

## 当前候选的图片交付

本周候选由 `meta.weekendSelection` 定义范围，每项须在 `image-review.json` 有明确状态。发布说明按“已显示/备妥待验/待核/未处理/未找到/不可用”分别计数，不以来源链接代替配图。更新状态须同步页面可见的图片说明；非已显示项不计入图片交付完成度。

新增检查：`node scripts/test-delivery-evidence.cjs` 和 `node scripts/check-delivery.cjs hangzhou/data.json hangzhou/image-review.json`。完整图片交付用 `--strict`，并另提交真实线上验收记录供检查。字段含义与完整交付门槛统一见上级 `DELIVERY_ACCEPTANCE.md`，不要复制另一套定义。

## 周末精选配图来源

列表和偏好筛选只展示逐张核实的小红书笔记原图，未核实则留空。更新 index.html 的 verifiedWeekendXhsImages 时，逐项用原帖和实际图对应核对作者、场次、刊发平台及可公开使用范围，再登记图路径与笔记直链。原帖链接、别场图或替代图不计为周末配图；image-review.json 中已有资料照和非小红书媒体的加载记录是历史素材证据，不是这一筛选口径的交付数量。票务、活动事实、地图和徒步路线图的来源不受此约束。
