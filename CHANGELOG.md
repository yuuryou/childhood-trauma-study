---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: f0a6a996fecad35f3342e9897b50bd7b_266daafd86a411f18108525400287e28
    ReservedCode1: WFdBMb3MrP7rvPEBqg8KD6guMi+lwenORIz0WSoPT/s9PfNxUaJsOECwj7SqW+5uQ+klSlJueAExN3upYptbZ7feZCkaY2N/BmpcF//JZUMz00lmCADzG70BaMtevhph4Kk/v7+k5/h7RhmymmcTBKUiLWUpvDJrpbhrXyGs6+UIuQ3rDVJa/Sbx8Bc=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: f0a6a996fecad35f3342e9897b50bd7b_266daafd86a411f18108525400287e28
    ReservedCode2: WFdBMb3MrP7rvPEBqg8KD6guMi+lwenORIz0WSoPT/s9PfNxUaJsOECwj7SqW+5uQ+klSlJueAExN3upYptbZ7feZCkaY2N/BmpcF//JZUMz00lmCADzG70BaMtevhph4Kk/v7+k5/h7RhmymmcTBKUiLWUpvDJrpbhrXyGs6+UIuQ3rDVJa/Sbx8Bc=
---

## 2026-07-23 - 全域更新 (使用者睡眠中, 自動執行)

### 變更
**影片**
- 從 Pixabay CDN 改為本地 background.mp4
- 移除 muted 屬性，預設有聲播放

**靜音按鈕**
- 三頁面浮動列尾端加入 mute-btn + toggleMute() JS

**響應式寬度**
- development.html: .main max-width:100% 於 768px/480px 斷點

**英文翻譯**
- 新建 cptsd-en.html, development-en.html, references-en.html
- 全站繁體中文→英文，學術語氣，HTML/CSS/JS 結構完全保留
- 內部鏈接指向英文版對應頁面

**語言切換**
- 所有頁面（中文+英文）浮動列加入語言切換按鈕
- 英文頁面: 「中文」按鈕→中文版
- 中文頁面: 「EN」按鈕→英文版

**入口頁**
- 新建 index.html 自動跳轉 cptsd-en.html（英文為預設語言）

**GitHub**
- 推送至 https://github.com/yuuryou/childhood-trauma-study
- Commit: "Full site update: English translation, local video, mute button, responsive fixes"
- 8 檔案變更, +4033/-1374 lines

### 檔案清單
E:\projects\childhood_trauma\website\
  CPTSD childhood trauma.html  (中文主頁, 已更新)
  cptsd-en.html               (英文主頁, 新建)
  development.html            (中文發展路徑, 已更新)
  development-en.html         (英文發展路徑, 新建)
  references.html             (中文文獻, 已更新)
  references-en.html          (英文文獻, 新建)
  index.html                  (入口→英文版, 新建)
  background.mp4              (本地影片)
*（内容由AI生成，仅供参考）*
