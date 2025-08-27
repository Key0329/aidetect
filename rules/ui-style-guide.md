# UI 風格指南

此文件記錄 AI Detect 工具集的完整 UI 設計系統，供未來 AI 開發時參考使用。

## 1. 色彩系統

### 1.1 主色調 (Primary)
```scss
primary: {
  100: '#EA475B', // 深紅色，用於重要強調
  200: '#FF7800', // 橘色，主要品牌色
  300: '#FF9100', // 亮橘色，按鈕和重點元素
  400: '#FFD6B2', // 淺橘色，禁用狀態
  500: '#FFEEDF', // 很淺橘色，背景色
  600: '#FFF7F0'  // 極淺橘色，卡片背景
}
```

**使用場景：**
- `primary-200`, `primary-300`: 主要 CTA 按鈕
- `primary-400`: 按鈕禁用狀態
- `primary-500`, `primary-600`: 背景色和卡片底色

### 1.2 次要色調 (Secondary)
```scss
secondary: {
  100: '#39C8D0', // 青綠色
  200: '#00AFB8', // 深青色，導航重點
  300: '#92CF53', // 明綠色，成功狀態
  400: '#6FB827', // 深綠色
  500: '#FFC31B'  // 金黃色，警告提示
}
```

**使用場景：**
- `secondary-200`: 導航活動狀態 (`text-#00AFB8`, `border-b-#00AFB8`)
- `secondary-300`: 功能圖示背景、技術特色卡片

### 1.3 第三色調 (Third)
```scss
third: {
  100: '#1654B9', // 深藍色
  200: '#4E91FF', // 亮藍色，功能卡片
  300: '#78269F'  // 紫色，特殊功能
}
```

**使用場景：**
- `third-200`: 商務卡片等特殊功能的圖示背景

### 1.4 灰階系統 (Grayscale)
```scss
grayscale: {
  100: '#F3F3F3', // 頁面背景色
  200: '#EEEEEE', // 分隔線、邊框
  300: '#DDDDDD', // 輕微邊框
  400: '#A9A9A9', // 次要文字
  500: '#7E7E7E', // 輔助文字
  600: '#292929'  // 主要文字、深色背景
}
```

**使用場景：**
- `grayscale-100`: 主要頁面背景 (`bg-#f3f3f3`)
- `grayscale-600`: 主要文字色彩、標頭背景 (`bg-#292929`)
- `grayscale-200`: 邊框線 (`border-b-#eee`)

## 2. 字體系統

### 2.1 字型家族
```scss
font-family: "Microsoft JhengHei", PingFangTC, Roboto, Arial, sans-serif;
```

### 2.2 字體尺寸階層
```scss
fontSize: {
  12: ['12px', '18px'], // 小型提示文字
  14: ['14px', '20px'], // 次要內容文字
  16: ['16px', '22px'], // 基本內容文字
  base: ['16px', '28px'], // 基礎行高較大的內容
  18: ['18px', '24px'], // 導航、重要內容
  20: ['20px', '28px'], // 小標題
  24: ['24px', '32px']  // 頁面標題
}
```

### 2.3 字重使用
- `font-normal` (400): 一般內容文字
- `font-bold` (700): 標題、重要資訊、導航
- `font-semibold`: 次標題

### 2.4 常用文字樣式
```css
/* 頁面主標題 */
.page-title { @apply text-24px font-bold text-grayscale-600; }

/* 導航文字 */
.nav-text { @apply text-18px leading-27px text-#292929 font-normal; }
.nav-active { @apply font-700 text-#00AFB8 border-b-solid border-b-#00AFB8 border-b-3; }

/* 卡片標題 */
.card-title { @apply text-20px font-bold text-grayscale-600; }

/* 描述文字 */
.description { @apply text-14px text-grayscale-500 leading-24px; }
```

## 3. 元件系統

### 3.1 按鈕元件
系統提供預定義的按鈕快捷方式：

```css
/* 主要按鈕 */
.button-primary-sm { @apply h-7; }
.button-primary-md { @apply min-w-26 h-9; }
.button-primary-lg { @apply min-w-41 h-11 text-18; }

/* 次要按鈕 */
.button-secondary-sm { @apply h-7; }
.button-secondary-md { @apply min-w-26 h-9; }
.button-secondary-lg { @apply min-w-41 h-11 text-18; }
```

**基礎樣式：**
- 主要按鈕：`text-white bg-primary-300`
- 次要按鈕：`text-primary-300 bg-white border border-primary-300`
- 禁用狀態：`disabled:(bg-primary-400 border-primary-400 cursor-auto)`

### 3.2 卡片元件
```css
/* 基礎卡片 */
.layout-card {
  @apply bg-white px-[10px] py-4 rounded-xl;
}

/* 功能卡片 */
.feature-card {
  @apply bg-white rounded-16px shadow-lg p-8;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  @apply shadow-xl;
  transform: translateY(-4px);
}
```

### 3.3 圖示元件
```css
/* 前綴圖示基礎樣式 */
.prefix-icon-base {
  @apply flex items-center before:(content-empty w-5 h-5 inline-block mr-2 bg-no-repeat bg-center);
}

/* 增加圖示 */
.prefix-icon-increase {
  @apply prefix-icon-base before:bg-[url(@/assets/images/icon_increase_light.svg)];
}
```

### 3.4 標頭元件
```css
/* 黑色標頭 */
.headerBlack {
  @apply bg-#292929 h-30px flex justify-start items-center;
}

/* 白色標頭 */
.headerWhite {
  @apply bg-white h-70px flex justify-between items-center px-16px border-b-solid border-b-1px border-b-#eee;
}
```

## 4. 佈局系統

### 4.1 間距系統
- `px-4`, `py-4`: 基本內邊距
- `px-8`, `py-8`: 中等內邊距
- `px-16`, `py-16`: 大內邊距
- `gap-6`, `gap-8`: 網格間距

### 4.2 圓角系統
- `rounded-8px`: 小元件 (圖示背景)
- `rounded-12px`: 中型元件 (圖示容器)
- `rounded-16px`: 大型卡片
- `rounded-xl`: 基礎卡片 (等同於 12px)

### 4.3 陰影系統
- `shadow-sm`: 輕微陰影 (標頭)
- `shadow-lg`: 標準卡片陰影
- `shadow-xl`: 懸停狀態加強陰影

### 4.4 響應式斷點
```css
/* 網格佈局範例 */
.responsive-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8;
}

.tech-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}
```

## 5. 互動狀態

### 5.1 懸停效果
```css
/* 卡片懸停 */
.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* 技術項目懸停 */
.tech-item {
  transition: transform 0.2s ease;
}

.tech-item:hover {
  transform: translateY(-2px);
}
```

### 5.2 過渡動畫
- 標準過渡：`transition-shadow duration-300`
- 快速過渡：`transition-transform duration-200`
- 懸停過渡：`hover:shadow-xl transition-shadow`

## 6. 頁面佈局模式

### 6.1 標準頁面結構
```html
<div class="min-h-screen bg-grayscale-100">
  <!-- 雙層標頭 -->
  <header class="bg-white shadow-sm">
    <div class="headerBlack"><!-- 導航連結 --></div>
    <div class="headerWhite"><!-- 頁面標題 --></div>
  </header>
  
  <!-- 導航列 (可選) -->
  <nav class="flex items-center px-44px h-40px bg-white">
    <!-- 導航項目 -->
  </nav>
  
  <!-- 主要內容 -->
  <main class="bg-#f3f3f3 py-10 px-6 mx-auto">
    <!-- 內容區域 -->
  </main>
</div>
```

### 6.2 卡片網格佈局
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <div class="feature-card">
    <!-- 圖示區 -->
    <div class="w-16 h-16 bg-primary-200 rounded-12px flex items-center justify-center mx-auto mb-4">
      <!-- 圖示內容 -->
    </div>
    <!-- 內容區 -->
    <h3 class="text-20px font-bold text-grayscale-600 mb-2">標題</h3>
    <p class="text-14px text-grayscale-500 mb-6 leading-24px">描述</p>
    <!-- 按鈕區 -->
    <NuxtLink to="/path" class="button-primary-lg">按鈕文字</NuxtLink>
  </div>
</div>
```

## 7. 使用指南

### 7.1 色彩使用最佳實踐
1. **主要 CTA** 使用 `primary-300` (FF9100)
2. **次要 CTA** 使用 `secondary-200` (00AFB8)  
3. **文字層級** 使用灰階系統 (600→500→400)
4. **背景層次** 使用 `grayscale-100` 和 `white` 區分

### 7.2 間距使用原則
1. **卡片內邊距** 使用 `p-8` 或 `px-[10px] py-4`
2. **頁面邊距** 使用 `px-4` 到 `px-16` 根據螢幕尺寸
3. **元素間距** 使用 `gap-6` 到 `gap-8` 保持一致性

### 7.3 字體使用建議
1. **頁面標題** 使用 24px bold
2. **卡片標題** 使用 20px bold
3. **導航文字** 使用 18px normal
4. **內容文字** 使用 14px-16px normal
5. **重要資訊** 使用 bold 字重強調

### 7.4 元件組合範例
```html
<!-- 標準功能卡片 -->
<div class="feature-card hover:shadow-xl transition-shadow duration-300">
  <div class="text-center mb-6">
    <div class="w-16 h-16 bg-secondary-200 rounded-12px flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-white"><!-- SVG 內容 --></svg>
    </div>
    <h3 class="text-20px font-bold text-grayscale-600 mb-2">功能標題</h3>
    <p class="text-14px text-grayscale-500 mb-6 leading-24px">功能描述文字</p>
  </div>
  <div class="text-center">
    <NuxtLink to="/path" class="button-primary-lg inline-flex items-center gap-2">
      按鈕文字
      <svg class="w-4 h-4"><!-- 箭頭圖示 --></svg>
    </NuxtLink>
  </div>
</div>
```

## 8. 工具類別速查

### 8.1 常用組合
```css
/* 文字截斷 */
.truncate-max-line {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

/* 置中容器 */
.container { @apply mx-auto px-4; }

/* 禁用狀態 */
.disable { @apply bg-primary-400 border-primary-400 cursor-auto; }
```

### 8.2 快速參考
- **主要色彩**: `bg-primary-300`, `text-white`
- **次要色彩**: `bg-secondary-200`, `text-white`  
- **文字色彩**: `text-grayscale-600`, `text-grayscale-500`
- **背景色彩**: `bg-grayscale-100`, `bg-white`
- **標準按鈕**: `button-primary-lg`, `button-secondary-md`
- **標準卡片**: `layout-card`, `feature-card`

---

**注意事項：**
此風格指南應與 UnoCSS 配置檔 (`uno.config.ts`) 保持同步。如有新增或修改樣式，請同時更新此文件。