# 杭州活动页维护

数据在 data.json。status：active 已核本周；pending 待核海报线索；permanent 长期候选；archived 历史活动。

每项保留 id、kind、area、title、venue、price、booking、checkedAt、sources；限时项填 dateStart/dateEnd。pending 还须 sourceNoteId、imagePage、itemIndex，并写明未独立验证。不得将海报标价或候选称为官方核实、可购、已预约或用户选择。

更新后运行 node hangzhou/test-data.cjs。推送后检查公开页与 /hangzhou/data.json。localStorage 键 hz:<id>，勿改既有 id。
