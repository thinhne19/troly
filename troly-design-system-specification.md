# Troly — Production UI/UX Design System & Product Specification
**Product:** Troly (Modern Rental Property Management SaaS for Vietnamese Landlords)  
**Target Users:** Landlords managing 10–100 rental units (Boarding houses / Chung cư mini / Căn hộ dịch vụ)  
**Design Philosophy:** Linear + Stripe + Notion + Airbnb Host. Calm, Dense, Professional, Data-First, 8pt Grid.  
**Version:** 1.0.0-Production-Ready  

---

## 1. Design System Architecture & Philosophy

### 1.1 Core Principles
* **Data-First Utility:** Vietnamese landlords operate under extreme time pressure during the 25th–5th monthly billing window. The UI prioritizes high information density, instant legibility of VND amounts, and zero decorative fluff.
* **Calm & Non-Intrusive:** Neutral slate surfaces with surgical accent highlights (Deep Indigo, Emerald for collections, Rose for debt). No glassmorphism, no neon glows, no distracting gradients.
* **Keyboard-First Desktop & Fast Thumb Mobile:** Desktop features `Cmd+K` command search, Excel-like arrow/tab grid traversal for meter logs, and batch shortcuts. Mobile provides bottom-anchored thumb zones and high-contrast numeric pads for dark stairwell meter readings.
* **Localization & Vietnamese Cultural Nuances:** 
  * Currency formatted strictly with Vietnamese standards: `4.500.000 ₫` (period thousand separator, trailing currency symbol).
  * Dual billing modes: Electricity by kWh (`kWh`), Water by volume (`m³`) or headcount (`người/tháng`).
  * VietQR / Napas 24/7 integration embedded directly into invoice workflows with instant copyable transfer syntaxes.
  * Zalo messaging shortcuts for 1-click invoice delivery and payment reminders.

### 1.2 Layout & Grid Foundations
* **Base Unit:** `8px` strict spatial grid (`4px` half-unit for dense table cells, icons, and micro-badges).
* **Breakpoints:**
  * **Mobile (Viewport 375px – 767px):** 4-column grid, 16px margins, 12px gutters. PWA bottom navigation.
  * **Tablet (Viewport 768px – 1199px):** 8-column grid, 24px margins, 16px gutters. Collapsible rail navigation.
  * **Desktop Standard (Viewport 1200px – 1439px):** 12-column grid, 32px margins, 20px gutters. Fixed 240px sidebar.
  * **Desktop Wide (Viewport 1440px+):** 12-column grid, max-width container 1600px, 32px gutters. Dense dual-pane view.
* **Corner Radius Matrix:**
  * `radius-sm`: `4px` (Tooltips, inner progress bars)
  * `radius-md`: `8px` (Inputs, buttons, dropdown items, status chips)
  * `radius-lg`: `12px` (Cards, modals, popovers, table containers)
  * `radius-xl`: `16px` (Slide-over drawer panels, bottom sheets)
  * `radius-full`: `9999px` (Avatars, counter badges, pill filters)
* **Shadow Hierarchy (Minimal, High Definition):**
  * `shadow-xs`: `0px 1px 2px rgba(15, 23, 42, 0.04)` (Buttons, subtle card border blend)
  * `shadow-sm`: `0px 2px 4px -1px rgba(15, 23, 42, 0.06), 0px 1px 2px -1px rgba(15, 23, 42, 0.04)` (Stat cards, hover states)
  * `shadow-md`: `0px 6px 12px -2px rgba(15, 23, 42, 0.08), 0px 3px 6px -2px rgba(15, 23, 42, 0.05)` (Dropdowns, popovers, command palette)
  * `shadow-lg`: `0px 16px 32px -4px rgba(15, 23, 42, 0.12), 0px 6px 12px -4px rgba(15, 23, 42, 0.06)` (Modals, drawers)

---

## 2. Color Tokens

### 2.1 Primitive Color Scales (Hex & Functional Range)

#### Neutral Slate (Cool Gray Scale)
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `color-slate-25` | `#FCFDFD` | App canvas background (ultra-crisp) |
| `color-slate-50` | `#F8FAFC` | Secondary panel background, table alternate row, inactive tabs |
| `color-slate-100` | `#F1F5F9` | Table headers, divider lines, disabled control backgrounds |
| `color-slate-200` | `#E2E8F0` | Default border, container stroke, card separators |
| `color-slate-300` | `#CBD5E1` | Input border hover, inactive icon stroke |
| `color-slate-400` | `#94A3B8` | Placeholder text, secondary icons, breadcrumb delimiters |
| `color-slate-500` | `#64748B` | Secondary text, helper labels, table column headers |
| `color-slate-700` | `#334155` | Strong body text, active icon fills, table values |
| `color-slate-900` | `#0F172A` | Primary headings, KPI figures, dominant typography |

#### Primary Deep Indigo (SaaS Anchor)
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `color-indigo-50` | `#EEF2FF` | Active row highlight, primary badge background |
| `color-indigo-100` | `#E0E7FF` | Selected item border, focused chip background |
| `color-indigo-500` | `#6366F1` | Interactive link hover, secondary accents |
| `color-indigo-600` | `#4F46E5` | Primary CTA button default, active tab indicator |
| `color-indigo-700` | `#4338CA` | Primary CTA button hover, deep selected state |
| `color-indigo-900` | `#312E81` | Brand identity accent, dark theme primary container |

#### Semantic Status Tokens
| Functional Category | Surface Token | Border Token | Text/Icon Token | Hex Codes (Bg / Border / Text) |
| :--- | :--- | :--- | :--- | :--- |
| **Success (Đã thanh toán / Đang thuê)** | `color-success-bg` | `color-success-border` | `color-success-text` | `#ECFDF5` / `#A7F3D0` / `#065F46` |
| **Warning (Chưa chốt số / Đang chờ cọc)** | `color-warning-bg` | `color-warning-border` | `color-warning-text` | `#FFFBEB` / `#FDE68A` / `#92400E` |
| **Danger (Nợ tiền phòng / Quá hạn / Trống)** | `color-danger-bg` | `color-danger-border` | `color-danger-text` | `#FFF1F2` / `#FECDD3` / `#9F1239` |
| **Info / Utility: Electricity** | `color-electric-bg`| `color-electric-border`| `color-electric-text`| `#FEF9C3` / `#FDE047` / `#854D0E` |
| **Info / Utility: Water** | `color-water-bg` | `color-water-border` | `color-water-text` | `#E0F2FE` / `#BAE6FD` / `#0369A1` |

### 2.2 Semantic Surface & Text Variables
```css
/* Light Mode Design System Root Variables */
--surface-canvas: #F8FAFC;
--surface-card: #FFFFFF;
--surface-subtle: #F1F5F9;
--surface-overlay: rgba(15, 23, 42, 0.45);

--border-subtle: #F1F5F9;
--border-default: #E2E8F0;
--border-hover: #CBD5E1;
--border-focus: #4F46E5;

--text-primary: #0F172A;
--text-secondary: #475569;
--text-tertiary: #94A3B8;
--text-inverse: #FFFFFF;

--interactive-primary: #4F46E5;
--interactive-primary-hover: #4338CA;
--interactive-danger: #E11D48;
--interactive-danger-hover: #BE123C;
```

---

## 3. Typography Scale

### 3.1 Type Specimen & Font Setup
* **Primary Family:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Tabular Figure Class:** All currency figures, meter metrics, dates, and phone numbers use OpenType features: `font-feature-settings: "tnum", "cv02", "cv03", "cv04", "cv11";`. This prevents visual jitter when sorting or live-calculating tables.

### 3.2 Type Hierarchy Table
| Style Name | Font Size | Line Height | Weight | Letter Spacing | Ideal Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display KPI** | `32px (2.000rem)` | `36px` | SemiBold (600) | `-0.025em` | Total monthly revenue, dashboard banner metrics |
| **Heading 1** | `24px (1.500rem)` | `32px` | SemiBold (600) | `-0.020em` | Page Titles (e.g., "Danh sách phòng", "Cài đặt") |
| **Heading 2** | `20px (1.250rem)` | `28px` | SemiBold (600) | `-0.015em` | Modal titles, section headers, property name |
| **Heading 3** | `16px (1.000rem)` | `24px` | Medium (500) | `-0.010em` | Card titles, tenant full name, drawer headers |
| **Body Large** | `15px (0.938rem)` | `22px` | Regular (400) | `0em` | Settings descriptions, modal intro summaries |
| **Body Regular** | `14px (0.875rem)` | `20px` | Regular (400) | `0em` | Primary table cell content, standard form inputs |
| **Body Medium** | `14px (0.875rem)` | `20px` | Medium (500) | `0em` | Button labels, active tab items, table primary ID |
| **Body Small** | `13px (0.813rem)` | `18px` | Regular (400) | `0.005em` | Helper text, breadcrumbs, timestamp meta |
| **Caption / Label**| `11px (0.688rem)` | `16px` | SemiBold (600) | `+0.040em` | Table column headers (UPPERCASE), status badges |
| **Monospace / Meter**| `14px (0.875rem)`| `20px` | Medium (500) | `0em` | kWh meter input, water m³, contract ID codes |

---

## 4. Spacing Tokens & Spatial Layout

### 4.1 8pt Spacing Scale
```
space-1   : 4px   /* Micro badges, inline icons, tight pill padding */
space-2   : 8px   /* Form input internal padding-y, card inner row gaps */
space-3   : 12px  /* Button padding-y, form control gap, badge padding-x */
space-4   : 16px  /* Standard container padding, card header-to-body margin */
space-5   : 20px  /* Modal content padding, filter ribbon gap */
space-6   : 24px  /* Standard card padding, grid gutter default */
space-8   : 32px  /* Section vertical spacing, page header bottom margin */
space-10  : 40px  /* Large widget margins, empty state container padding */
space-12  : 48px  /* Page bottom scroll padding, auth screen top buffer */
space-16  : 64px  /* Auth container vertical buffer, hero section padding */
```

### 4.2 Data Density Modes
* **High-Density Table Mode (Default for Meter Reading & Room List):**
  * Table row height: `44px`
  * Cell padding: `8px 12px`
  * Font size: `13px` / `14px`
* **Comfortable Mode (Tenant Timeline & Properties View):**
  * Card padding: `20px`
  * Row height: `56px`
  * Cell padding: `14px 16px`

---

## 5. Iconography Rules

* **Icon Set:** Lucide Icons (geometric, clear, open, uniform visual weight).
* **Grid & Stroke:**
  * Base grid: `24x24px` viewport with 2px internal safety margin.
  * Stroke width: `1.75px` for standard controls, `2.0px` for 16px micro icons to preserve sharpness on standard DPI screens.
  * Stroke Caps & Joins: `round`.
* **Standard Icon Sizes:**
  * `14px`: Badges, inline table indicators, breadcrumb separators (`ChevronRight`).
  * `16px`: Form input leading icons (`Search`, `Calendar`), compact buttons.
  * `20px`: Sidebar navigation items, standard buttons, table action triggers.
  * `24px`: Page header icons, stat card visual anchors, modal header symbols.
  * `48px`: Empty state centerpieces (encased in a 64px rounded `color-slate-100` container).
* **Vietnamese Domain-Specific Icon Metaphors:**
  * Electricity: `Zap` (Yellow amber stroke `#D97706`).
  * Water: `Droplet` (Cyan sky stroke `#0284C7`).
  * Rent / Payment: `Banknote` or `QrCode` (Indigo / Emerald).
  * Landlord House: `Building2` or `Home`.
  * Meter Log: `Gauge` or `ClipboardList`.
  * Tenant CCCD: `IdCard` or `ShieldCheck`.
  * Zalo Direct Share: `Send` or `MessageCircle`.

---

## 6. Layout Blueprints (Desktop, Tablet, Mobile PWA)

### 6.1 Desktop Layout Blueprint (1440px+)
```
+----------------------------------------------------------------------------------------------------+
|  TROLY APP SHELL (Desktop 1440px)                                                                  |
+-------------------+--------------------------------------------------------------------------------+
| [Troly Logo]      | [Search Rooms, Tenants, Bills... Cmd+K]       [Property: Chung cư mini Q.7 v] [🔔] [User]|
+-------------------+--------------------------------------------------------------------------------+
| SIDEBAR (240px)   | PAGE HEADER: Dashboard Overview                                                |
|                   | Thống kê tháng 09/2026                 [+ Tạo hóa đơn]  [+ Ghi điện nước]      |
| [📊 Dashboard]    +--------------------------------------------------------------------------------+
| [🏢 Nhà trọ (3)]  | STAT CARDS ROW (4 Columns, 8pt Grid, 12px Radius, 1px Slate-200 border)       |
| [🚪 Phòng (48)]   | [ Doanh thu tháng ] [ Tỷ lệ lấp đầy ] [ Hóa đơn chưa nộp ] [ Nợ đọng tồn đọng ]|
| [⚡ Ghi điện nước]| [ 184.250.000 ₫   ] [ 94.2% (45/48) ] [ 7 phòng         ] [ 18.400.000 ₫     ] |
| [🧾 Hóa đơn]      +--------------------------------------------------------------------------------+
| [👥 Khách thuê]   | MAIN WORKSPACE (Dual Column 8 / 4 Grid)                                        |
| [📈 Báo cáo]      | +-----------------------------------------+ +--------------------------------+ |
|                   | | CHARTS AREA (8 cols)                    | | RECENT ACTIVITY (4 cols)       | |
| --- HỆ THỐNG ---  | | Biểu đồ doanh thu 6 tháng qua           | | [⚡] P.302 ghi điện: 142 kWh    | |
| [⚙️ Cài đặt giá]  | | [Bar/Line combo: Tiền phòng vs Dịch vụ] | | [💳] P.104 đã thanh toán VietQR| |
| [📋 Mẫu hóa đơn]  | | Tỷ lệ phòng: [Donut: 45 Thuê / 3 Trống] | | [👥] Hợp đồng mới: Nguyễn An   | |
|                   | +-----------------------------------------+ +--------------------------------+ |
| [v1.0 • Hỗ trợ]   | TABLE PREVIEW: Phòng cần thu tiền tháng 09 (Dense Table, sticky header)        |
+-------------------+--------------------------------------------------------------------------------+
```

### 6.2 Tablet Layout Blueprint (768px – 1024px)
* Sidebar collapses into a slim 64px icon rail (with tooltip flyouts on hover).
* Top bar houses the Property Switcher dropdown and Profile avatar.
* Stat cards reflow into a 2x2 grid.
* Tables retain horizontal scrollability with fixed left column (Room Number & Tenant Name).

### 6.3 Mobile & PWA Layout Blueprint (375px – 430px)
```
+------------------------------------------+
| 09:41                             [📶 🔋]|
| TROLY             [Nhà Trọ Lê Văn Sỹ v]  |
+------------------------------------------+
| QUICK STATS (Horizontal Scroll Carousel) |
| [ 184.2M ₫ Rev ] [ 45/48 Thuê ] [ 7 Nợ ] |
+------------------------------------------+
| ACTION SHORTCUTS (Large Touch Targets)   |
| [⚡ Ghi số điện] [🧾 Lập hóa đơn] [👥 Khách]|
+------------------------------------------+
| CRITICAL ALERTS (Late Payments)          |
| ! 3 phòng trễ hạn > 5 ngày               |
|   P.201 - Trần Minh (Quá hạn 3 ngày) >   |
|   P.305 - Lê Hương (Quá hạn 7 ngày)  >   |
+------------------------------------------+
| RECENT ACTIVITY FEED                     |
| • P.102: Đã thanh toán 4.850.000 ₫ (10p) |
| • P.404: Đã chốt số điện nước            |
+------------------------------------------+
| BOTTOM NAVIGATION BAR (Fixed 64px)       |
| [📊 Tổng quan] [🚪 Phòng] [⚡ Ghi số] [🧾 Bill] [⚙️]|
+------------------------------------------+
```

---

## 7. Component Library Specifications

### 7.1 Buttons
* **Anatomy:** Container + Optional Leading Icon (16px) + Label (Inter Medium 14px) + Optional Trailing Icon / Badge + Loading Spinner.
* **Height Matrix:**
  * `SM`: `32px` height, `padding: 0 12px`, `font-size: 13px` (Table cell actions, filter tags).
  * `MD` (Default): `40px` height, `padding: 0 16px`, `font-size: 14px` (Standard forms, toolbar buttons).
  * `LG`: `48px` height, `padding: 0 20px`, `font-size: 15px` (Mobile CTAs, Auth submission, Bulk save).
* **Variants:**
  * `Primary`: Background `#4F46E5`, Text `#FFFFFF`, Hover `#4338CA`, Active `#3730A3`, Focus Ring `2px #A5B4FC`, Disabled `bg: #E2E8F0, text: #94A3B8`.
  * `Secondary`: Background `#FFFFFF`, Border `1px solid #CBD5E1`, Text `#334155`, Hover `bg: #F8FAFC, border: #94A3B8`, Active `bg: #F1F5F9`.
  * `Ghost`: Background `transparent`, Text `#475569`, Hover `bg: #F1F5F9, text: #0F172A`.
  * `Danger`: Background `#E11D48`, Text `#FFFFFF`, Hover `#BE123C`, Active `#9F1239`.

### 7.2 Form Inputs & Numeric Formats
* **Standard Text Input:**
  * Height: `40px`, Radius: `8px`, Border: `1px solid #CBD5E1`, Background: `#FFFFFF`.
  * Focus: `border: #4F46E5`, Box-shadow: `0 0 0 3px rgba(79, 70, 229, 0.12)`.
  * Label: `13px Inter Medium`, Text: `#334155`, Margin-bottom: `6px`.
* **Vietnamese Currency (VND) Input:**
  * Trailing adornment: `₫` fixed badge in `#F1F5F9`.
  * Auto-formatting mask: Commas or dots every 3 digits on keypress (`4.500.000`).
* **Meter Reading Fast-Input (High Productivity):**
  * Monospace tabular numbers (`16px Inter SemiBold`).
  * Key navigation: `Tab` / `Right Arrow` jumps to next cell, `Enter` commits row and moves down.
  * Auto-validation: If `Current < Previous`, trigger warning ring `#F59E0B` with tooltip: *"Chỉ số mới nhỏ hơn chỉ số cũ! Vui lòng kiểm tra lại"*.

### 7.3 Data Table (Enterprise SaaS Standard)
* **Header:** Height `36px`, Background `#F8FAFC`, Border-bottom `1px solid #E2E8F0`, Text `11px SemiBold #64748B UPPERCASE`.
* **Row:** Height `48px` (Standard) or `40px` (Compact), Border-bottom `1px solid #F1F5F9`, Hover background `#F8FAFC`.
* **Selection State:** Row background `#EEF2FF`, Checkbox checked Indigo `#4F46E5`.
* **Sticky Header:** `position: sticky; top: 0; z-index: 10; backdrop-filter: blur(8px)`.
* **Actions Column:** Fixed right, 3-dot dropdown trigger or direct icon buttons on row hover.

### 7.4 Status Chips & Badges
* Height: `24px`, Radius: `9999px`, Padding: `2px 10px`, Font: `12px Inter Medium`.
* **Status Matrix:**
  * `Đang thuê (Occupied)`: Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46`, Dot `#10B981`.
  * `Phòng trống (Vacant)`: Background `#F1F5F9`, Border `#CBD5E1`, Text `#475569`, Dot `#94A3B8`.
  * `Đã thanh toán (Paid)`: Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46`.
  * `Chưa thanh toán (Unpaid)`: Background `#FFFBEB`, Border `#FDE68A`, Text `#92400E`.
  * `Quá hạn (Overdue)`: Background `#FFF1F2`, Border `#FECDD3`, Text `#9F1239`.
  * `Đã cọc (Deposited)`: Background `#EFF6FF`, Border `#BFDBFE`, Text `#1E40AF`.

### 7.5 Modal & Slide-over Drawer
* **Modal Dialog:** Max-width `520px` (standard) or `720px` (large), Radius `12px`, Border `1px solid #E2E8F0`, Elevation `shadow-lg`. Backdrop `rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(4px)`.
* **Slide-over Drawer:** Width `480px` on desktop, `100vw` on mobile. Slides from right with cubic-bezier easing `(0.16, 1, 0.3, 1)`. Houses quick tenant edit, room details, and contract documents.

---

## 8. Detailed Screen Specifications (The 9 Core Pages)

### 8.1 Page 1: Authentication (Xác thực & Đăng nhập)
* **Goal:** Frictionless entry for Vietnamese landlords who frequently forget complex passwords.
* **Layout Structure:**
  * Centered card on clean `#F8FAFC` background with subtle architectural blueprint motif watermark.
  * Brand logo: Troly mark with geometric keyhole + roof icon in Deep Indigo.
* **Step 1 — Phone Number Entry:**
  * Country selector locked to `Vietnam (+84)` with VN flag indicator.
  * Large phone number input (`18px Inter Medium`, placeholder: `0912 345 678`).
  * Primary Button: `"Nhận mã xác thực OTP"` (Full width, 48px).
  * Checkbox: `"Duy trì đăng nhập 30 ngày (Ghi nhớ thiết bị này)"` (Default: Checked).
  * Trust badge: *"Bảo mật dữ liệu chuẩn mã hóa ngân hàng 256-bit"*.
* **Step 2 — 6-Digit OTP Verification:**
  * 6 individual high-contrast numeric boxes (`48x56px`, `radius-md: 8px`).
  * Auto-focus first box; auto-advances on entry; auto-pastes complete SMS code.
  * Countdown timer: *"Gửi lại mã sau 45s"* (Changes to clickable link when `0s`).
  * Quick back link: `"Đổi số điện thoại"`.

### 8.2 Page 2: Dashboard (Tổng quan điều hành)
* **Target:** Real-time visibility into cash flow, vacant assets, and collection health.
* **Widget Layout (Top Metric Row):**
  * **Card 1: Tổng doanh thu tháng (Revenue)**
    * Value: `184.250.000 ₫` (Display KPI 32px Bold).
    * Sub-metric: `+8.4%` vs tháng trước (Emerald pill with trending up arrow).
    * Progress bar: `Đã thu 155.850.000 ₫ (84.5%)` / `Còn lại 28.400.000 ₫`.
  * **Card 2: Tỷ lệ lấp đầy (Occupancy)**
    * Value: `93.8%` (45 / 48 phòng).
    * Sub-metric: `3 phòng trống` (Rose alert dot if > 5 days).
  * **Card 3: Hóa đơn chờ xử lý (Pending Invoices)**
    * Value: `8 hóa đơn`.
    * Breakdown: `5 chưa thanh toán` / `3 quá hạn đóng tiền`.
  * **Card 4: Tỷ lệ thu tiền (Collection Rate)**
    * Value: `84.5%`.
    * Target marker: Benchmark 95% by 5th of every month.
* **Data Visualization Section:**
  * **Chart Left (8 Cols): Doanh thu 6 tháng gần nhất**
    * Stacked bar chart: Base rent (Indigo `#4F46E5`), Electricity (`#F59E0B`), Water (`#0284C7`), Other services (`#10B981`).
    * Hover tooltip: Exact breakdown of revenue per source with period comparison.
  * **Chart Right (4 Cols): Trạng thái phòng & thanh toán**
    * Dual-ring donut chart: Outer ring = Phòng (Đang thuê 45, Trống 3, Đang sửa 0); Inner ring = Thanh toán (Đã trả 37, Chưa trả 8).
* **Recent Activity Feed (Bảng tin hoạt động):**
  * Chronological list with time stamps and visual status pills:
    * `10:24` — **P.203 (Nhà trọ Lê Văn Sỹ):** Khách chuyển khoản `4.850.000 ₫` qua VietQR (Tự động khớp).
    * `08:45` — **P.101 (Chung cư mini Q.7):** Đã ghi số điện nước mới (Điện: 215 kWh, Nước: 12 m³).
    * `Hôm qua` — **P.304:** Ký hợp đồng gia hạn 12 tháng — Nguyễn Thị Thu Hà.

### 8.3 Page 3: Properties (Quản lý Nhà trọ / Tòa nhà)
* **Header Controls:**
  * View Toggle: `[Grid Cards View]` / `[Compact Table View]`.
  * Search property by name/address.
  * Floating / Fixed CTA Button: `+ Thêm tòa nhà mới` (Deep Indigo).
* **Property Card Anatomy:**
  * Card Header: Property Name (e.g., `"Nhà trọ KTX 128 Lê Văn Sỹ, P.10, Phú Nhuận"`).
  * Status Pill: `24/24 Phòng đầy (100%)` (Emerald).
  * Quick Metrics Grid:
    * Doanh thu dự kiến: `96.000.000 ₫/tháng`.
    * Giá điện: `3.800 ₫/kWh` | Giá nước: `18.000 ₫/m³`.
    * Quản lý: `Nguyễn Văn Thìn (0903 xxx xxx)`.
  * Footer: Direct link buttons: `[Quản lý phòng]` • `[Chốt điện nước]` • `[Cài đặt tòa]`.

### 8.4 Page 4: Rooms (Danh mục phòng chi tiết)
* **Layout:** Dense table with quick-filter pills on top:
  * Filter pills: `Tất cả (48)` | `Đang thuê (45)` | `Phòng trống (3)` | `Nợ tiền phòng (5)` | `Hết hạn hợp đồng (2)`.
* **Table Columns:**
  1. `Checkbox`: Multi-select for bulk invoice generation or reminder broadcast.
  2. `Phòng`: P.101, P.102 (Medium weight, click opens Tenant Drawer).
  3. `Khách thuê`: Avatar + Full name (Nguyễn Văn A) + Phone icon (click to call/Zalo).
  4. `Trạng thái`: Status chip (`Đang thuê`, `Trống`, `Quá hạn`).
  5. `Tiền phòng cơ bản`: `4.500.000 ₫`.
  6. `Chỉ số điện`: `245 kWh` (with amber lightning icon, showing difference from last month `+68 kWh`).
  7. `Chỉ số nước`: `14 m³` (with cyan water droplet icon, difference `+4 m³`).
  8. `Hóa đơn tháng 09`: Status badge (`Đã thanh toán`, `Chờ thanh toán`, `Chưa tạo`).
  9. `Hành động`: Quick icon group `[🧾 Xem bill]` `[⚡ Ghi số]` `[💬 Gửi Zalo]` `[•••]`.

### 8.5 Page 5: Tenant Profile (Hồ sơ khách thuê)
* **Header:** Breadcrumb `Nhà trọ Lê Văn Sỹ / P.202 / Nguyễn Hoàng Nam` + Action Button `[Chấm dứt hợp đồng]` `[Sửa thông tin]`.
* **Two-Column Split Layout:**
  * **Left Column (380px) — Identity & Legal:**
    * Avatar + Full Name: `Nguyễn Hoàng Nam (26 tuổi)`.
    * Contact info: Phone `0987 654 321` with 1-click `[Chat Zalo]` and `[Gọi điện]`.
    * CCCD / Identification: `079098001234`, Issued `15/04/2021` (Bao gồm ảnh chụp mặt trước & mặt sau CCCD phóng to khi click).
    * Hợp đồng thuê: `HD-2026-0202`, Thời hạn: `01/10/2025 – 30/09/2026` (Còn 13 ngày - Cảnh báo tái ký).
    * Tiền đặt cọc: `5.000.000 ₫` (Trạng thái: Đang giữ).
  * **Right Column (Remaining Width) — Financial & Bills:**
    * **Active Invoice Card:** Hóa đơn tháng 09/2026: `5.420.000 ₫` (Trạng thái: `Chưa thanh toán`).
      * Detailed breakdown: Tiền nhà `4.500.000 ₫`, Điện (120 kWh x 3.800) = `456.000 ₫`, Nước (8m³ x 18.000) = `144.000 ₫`, Xe máy (2 xe) = `200.000 ₫`, Wifi = `120.000 ₫`.
    * **Payment History Ledger:** Compact table showing past 12 months with date paid, transaction method (VietQR Napas / Tiền mặt), and downloadable PDF receipts.
  * **Bottom Timeline (Lịch sử hoạt động phòng):**
    * Vertical audit log:
      * `15/09/2026`: Phát hành hóa đơn tháng 09 qua Zalo.
      * `01/09/2026`: Chốt chỉ số điện nước tháng 08 (Điện: 1.240 kWh).
      * `01/10/2025`: Nhận phòng, nộp cọc 5.000.000 ₫, bàn giao 2 chìa khóa cổng + 1 thẻ từ thang máy.

### 8.6 Page 6: Meter Reading (Ghi chỉ số điện nước - High-Speed Input)
* **UX Objective:** Allow a landlord walking with a phone or typing at a desktop keyboard to input readings for 50 rooms in under 3 minutes without touching a mouse.
* **Layout Grid Header:**
  * Month selector: `Tháng 09/2026` + Building selector.
  * Bulk action: `[Tự động tính toán & Xem trước]` `[Lưu & Tạo tất cả hóa đơn]`.
* **High-Speed Input Table:**
| Phòng | Điện Cũ (kWh) | Điện Mới (kWh) | Tiêu thụ (kWh) | Nước Cũ (m³) | Nước Mới (m³) | Tiêu thụ (m³) | Thành tiền dự tính | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P.101** | 1.450 | `[ 1.582 ]` | **132** | 42 | `[ 48 ]` | **6** | 609.600 ₫ | `[Đã nhập ✓]` |
| **P.102** | 980 | `[ 1.050 ]` | **70** | 30 | `[ 34 ]` | **4** | 338.000 ₫ | `[Đã nhập ✓]` |
| **P.103** | 2.110 | `[ 2.100 ! ]`| **-10 (Lỗi)** | 55 | `[    ]` | — | — | `[Cảnh báo !]` |
* **Productivity Features:**
  * `Tab` key moves: `P.101 Điện Mới` -> `P.101 Nước Mới` -> `P.102 Điện Mới` -> `P.102 Nước Mới`.
  * Instant automatic difference calculation and error boundary checking.
  * Mobile PWA camera scan helper: Click tiny camera icon to trigger OCR scanner that reads numeric counter wheels automatically.

### 8.7 Page 7: Invoice & VietQR Receipt (Hóa đơn A4 Chuẩn In ấn & Mobile Share)
* **Dimension:** Standard ISO A4 (`210mm x 297mm`) printable stylesheet + Mobile Web Preview.
* **Invoice Layout Components:**
  1. **Header Section:**
     * Left: Logo `TROLY` + Tên cơ sở: `HỆ THỐNG PHÒNG TRỌ XANH` + Địa chỉ: `128 Lê Văn Sỹ, P.10, Q.Phú Nhuận, TP.HCM` + Hotline/Zalo: `0908 123 456`.
     * Right: `HÓA ĐƠN TIỀN NHÀ` + Số: `HD-202609-P202` + Ngày lập: `25/09/2026` + Kỳ thanh toán: `Tháng 09/2026`.
  2. **Tenant Information Box:**
     * Người thuê: `Nguyễn Hoàng Nam` | Phòng: `202 (Lầu 2)`.
     * Số điện thoại: `0987 654 321` | Ngày chuyển vào: `01/10/2025`.
  3. **Itemized Billing Table (Bảng kê chi tiết):**
     * `Khoản mục` | `Chỉ số cũ` | `Chỉ số mới` | `Số lượng` | `Đơn giá (₫)` | `Thành tiền (₫)`
     * `1. Tiền thuê phòng` | - | - | 01 tháng | 4.500.000 | 4.500.000
     * `2. Tiền điện` | 1.120 | 1.240 | 120 kWh | 3.800 | 456.000
     * `3. Tiền nước sinh hoạt` | 45 | 53 | 8 m³ | 18.000 | 144.000
     * `4. Phí internet / Wifi` | - | - | 01 phòng | 100.000 | 100.000
     * `5. Rác & Vệ sinh chung` | - | - | 02 người | 40.000 | 80.000
     * `6. Phí gửi xe máy` | - | - | 02 xe | 100.000 | 200.000
  4. **Total Calculation Summary:**
     * Tổng cộng kỳ này: **`5.480.000 ₫`** (Viết bằng chữ: *Năm triệu bốn trăm tám mươi nghìn đồng chẵn*).
     * Hạn thanh toán: **Trước 23:59 ngày 05/10/2026**.
  5. **Payment Settlement Box (VietQR Integration):**
     * Dynamic VietQR / Napas247 code generated with embedded payload:
       * Ngân hàng: `MB Bank (Quân Đội)`.
       * Số tài khoản: `999908123456`.
       * Chủ tài khoản: `NGUYEN VAN THIN`.
       * Số tiền chính xác: `5.480.000`.
       * Nội dung chuyển khoản: `TROLY P202 T09`.
     * Landlord note: *"Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động ghi nhận gạch nợ sau 30 giây."*

### 8.8 Page 8: Analytics & Financial Reports (Báo cáo chuyên sâu)
* **Metrics & Deep-Dive Views:**
  * **Revenue Realization Waterfall:** Projected Gross Rent vs Actual Collections vs Remaining Arrears.
  * **Utility Profit/Loss Analysis:** Comparison between total utility bills paid to EVN/Sawaco vs collected from tenants (vital for Vietnamese landlords to verify they are not losing money on line loss or common area electricity).
  * **Debt Aging Matrix (Tuổi nợ):**
    * `1 – 3 ngày quá hạn`: 4 phòng (`18.200.000 ₫`).
    * `4 – 7 ngày quá hạn`: 2 phòng (`9.100.000 ₫`).
    * `> 7 ngày quá hạn (Báo động)`: 1 phòng (`5.400.000 ₫`).
  * **Average Tenancy Duration (Tuổi thọ khách thuê trung bình):** `14.2 tháng` — measures tenant churn rate.
* **Export Hub:** One-click instant export to `Excel (.xlsx)`, `CSV`, or `Báo cáo nộp thuế hộ kinh doanh`.

### 8.9 Page 9: Settings (Cấu hình hệ thống & Bảng giá)
* **Tabbed Architecture:**
  * **Tab 1: Bảng giá dịch vụ (Utility & Service Rates):**
    * Điện: Radio choice (`Đồng giá theo kWh` vs `Bậc thang EVN`). Input: `3.800 ₫/kWh`.
    * Nước: Radio choice (`Theo m³` vs `Khoán theo đầu người` vs `Khoán theo phòng`). Input: `18.000 ₫/m³` or `100.000 ₫/người/tháng`.
    * Phí dịch vụ cố định: Rác (`50.000 ₫/phòng`), Wifi (`100.000 ₫/phòng`), Thang máy (`50.000 ₫/người`).
  * **Tab 2: Tài khoản thụ hưởng VietQR (Bank & QR Config):**
    * Chọn ngân hàng thụ hưởng (VietinBank, Vietcombank, MB Bank, Techcombank, ACB...).
    * Số tài khoản, Tên chủ thẻ.
    * Cú pháp chuyển khoản tùy chỉnh (e.g., `[MA_NHA] [MA_PHONG] [THANG]`).
  * **Tab 3: Mẫu thông báo & Hóa đơn (Templates & Automations):**
    * Zalo message template editor with smart variables: `{{ten_khach}}`, `{{so_phong}}`, `{{tong_tien}}`, `{{link_vietqr}}`.
    * Ngày gửi hóa đơn định kỳ tự động: Ngày 25 hàng tháng.
    * Ngày gửi tin nhắc nợ tự động: Ngày 03 và Ngày 05 hàng tháng.

---

## 9. Interactive User Flows & Edge Cases

### 9.1 Monthly Collection Workflow (Happy Path)
1. **Day 25:** Landlord opens Meter Reading screen on mobile or desktop.
2. **Batch Entry:** Inputs Electricity & Water meters. Real-time diff validates against historical average.
3. **Invoice Synthesis:** Clicks "Lưu & Tạo tất cả hóa đơn". System batch-generates 48 invoices with unique VietQR payloads.
4. **Zalo Distribution:** 1-Click "Gửi thông báo Zalo". Tenants receive direct bill breakdown with dynamic VietQR image and payment link.
5. **Auto Reconciliation:** Tenant scans QR in banking app (Vietcombank, Techcombank, etc.). Banking webhook matches `TROLY P202 T09`. Room status automatically turns green `ĐÃ THANH TOÁN`.

### 9.2 Edge Cases & Error Recovery
* **Partial Payment (Khách đóng trước một phần):** Invoice marks as `Thanh toán 1 phần`, updates remaining debt, and re-calculates dynamic QR for the exact leftover amount.
* **Meter Replacement (Thay mới công tơ):** Flag `"Công tơ thay mới / Reset số 0"` suppresses negative diff alerts.
* **Mid-Month Termination (Trả phòng giữa chừng):** Proration engine automatically prorates base rent, pulls final meter readings on handover day, and computes final refund balance against deposit.

---

## 10. Figma-Ready Production Specification

### 10.1 Variable Taxonomy (Design Tokens Community Group W3C Standard)
```
troly-tokens/
├── primitives/
│   ├── color/
│   │   ├── slate/{25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900}
│   │   ├── indigo/{50, 100, 200, 300, 400, 500, 600, 700, 800, 900}
│   │   ├── emerald/{50, 100, 200, ..., 900}
│   │   └── rose/{50, 100, ..., 900}
│   ├── spacing/{1, 2, 3, 4, 5, 6, 8, 10, 12, 16}
│   └── radius/{none, sm, md, lg, xl, full}
├── semantics/
│   ├── surface/{canvas, default, subtle, muted, overlay}
│   ├── text/{primary, secondary, muted, inverse, brand, danger}
│   ├── border/{default, subtle, strong, focus, error}
│   └── status/{success, warning, danger, info}
└── components/
    ├── button/{primary-bg, primary-hover, secondary-border, ...}
    ├── input/{bg, border, border-focus, text, placeholder}
    ├── table/{header-bg, row-hover, border, cell-padding}
    └── chip/{occupied-bg, vacant-bg, overdue-bg}
```

### 10.2 Auto Layout & Constraints Rules
* **Buttons:** `Auto layout: Horizontal`, `Padding: 8px 16px`, `Gap: 8px`, `Resizing: Hug contents` (Desktop) or `Fill container` (Mobile).
* **Stat Cards:** `Auto layout: Vertical`, `Padding: 24px`, `Gap: 16px`, `Resizing: Fill container` (Grid column flex), `Radius: 12px`, `Stroke: 1px Inside #E2E8F0`.
* **Data Table Rows:** `Auto layout: Horizontal`, `Alignment: Center Left`, `Height: Fixed 48px`, `Padding: 0 16px`, `Resizing: Fill container`.
* **Modals:** `Auto layout: Vertical`, `Max width: 560px`, `Radius: 12px`, `Padding: 24px`, `Gap: 20px`, `Constraints: Center Center`.
