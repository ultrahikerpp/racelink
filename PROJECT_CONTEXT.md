RaceLink Taiwan 開發母檔 (Source of Truth)
1. 專案概述 (Project Overview)
目標： 建立台灣馬拉松整合資訊平台。

開發模式： Vibe Coding (Solo Founder + AI)。

核心價值： 賽事整合、智慧氣象穿搭、跨平台個人 PB 牆、遊戲化體驗。

2. 技術棧 (Tech Stack)
Frontend: Next.js (App Router), Tailwind CSS.

Backend/DB: Supabase (PostgreSQL), Auth, Storage.

Data Scraper: Python (BeautifulSoup/Playwright).

AI Stack: Gemini 1.5 Pro + Antigravity.

3. 資料庫結構 (Database Schema)
已定義表：races, profiles, race_logs, logistics_info, weather_cache。 (參見下列之 SQL 建表語句)
-- 1. 賽事主表 (Races)
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,                     -- 賽事名稱
  description TEXT,                        -- 賽事簡介
  race_date DATE NOT NULL,                 -- 比賽日期
  city TEXT NOT NULL,                      -- 縣市 (如：台北市)
  location_name TEXT,                      -- 起跑點名稱
  coordinates GEOGRAPHY(POINT),            -- 經緯度 (用於地圖導航)
  distances JSONB,                         -- 比賽項目 (如：["全馬", "半馬"])
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  official_url TEXT,                       -- 報名連結
  image_url TEXT,                          -- 賽事封面圖
  status TEXT DEFAULT 'upcoming',          -- 狀態：upcoming, open, closed, finished
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 使用者資料表 (Users - 擴充 Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  total_distance FLOAT DEFAULT 0,          -- 累計跑量
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 賽事紀錄/成績表 (Race Logs)
CREATE TABLE race_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id),        -- 連結官方賽事
  custom_race_name TEXT,                   -- 若賽事不在資料庫，可手動輸入
  finish_time INTERVAL,                    -- 完賽時間 (HH:MM:SS)
  overall_rank INTEGER,                    -- 總名次
  category_rank INTEGER,                   -- 分組名次
  certificate_url TEXT,                    -- 成績證明圖檔
  is_pb BOOLEAN DEFAULT FALSE,             -- 是否為個人最佳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 停車與物流資訊 (Logistics)
CREATE TABLE logistics_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  category TEXT,                           -- 類型：parking, shuttle, toilet
  name TEXT,                               -- 名稱 (如：中山停車場)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,                        -- 步行距離或備註
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 氣象緩存表 (Weather Cache - 減少 API 調用)
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  recorded_at DATE,                        -- 預報/歷史日期
  avg_temp FLOAT,                          -- 平均氣溫
  max_temp FLOAT,
  min_temp FLOAT,
  precipitation FLOAT,                     -- 降雨量
  apparel_advice TEXT,                     -- 穿搭建議標籤
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

4. 八角哲學 (Octalysis) 靜態原型需求
本階段目標為製作具備遊戲化元素的純靜態 HTML/Tailwind 原型。

模組開發清單：
史詩意義 (Drive 1)： 台灣賽事環島地圖 (SVG 互動式區域解鎖)。

進度成就 (Drive 2)： 數位獎牌櫃 (Grid 佈局，含 Gray-scale 未達成效果)。

創意回饋 (Drive 3)： 智慧裝備實驗室 (具備 Toggle 回饋的互動清單)。

所有權感 (Drive 4)： 跑者個人數位履歷 (Runner CV) 視覺化頁面。

社會影響 (Drive 5)： 賽道戰友榜與社群評論模組。

稀缺迫切 (Drive 6)： 報名截止倒數計時組件。

未知好奇 (Drive 7)： 跑者隨機驚喜包 (Modal 彈窗互動)。

損失逃避 (Drive 8)： 連續週跑火苗紀錄器 (Streak Counter)。

上述模組開發清單的詳細說明：
1. 史詩意義與使命感 (Epic Meaning & Calling)
介面元件： 「台灣跑者環島任務地圖」

實作方式： 在首頁放一個台灣地圖（可用 SVG 或簡單圖片），將台灣劃分為「北、中、南、東、離島」五大區域。

測試重點： 詢問跑者看到「解鎖全台賽事」的視覺目標時，是否會激發他們參與不曾去過的縣市賽事的慾望？

2. 進度與成就感 (Development & Accomplishment)
介面元件： 「數位獎牌陳列櫃 (The Trophy Room)」

實作方式： 建立一個 Grid 佈局，展示各種樣式的獎牌圖示。已完賽的賽事獎牌發光，未參加的顯示為灰色陰影（Grayed out）。

測試重點： 跑者是否會為了「點亮」那個灰色的獎牌而想要上傳紀錄？

3. 創意與回饋 (Empowerment of Creativity & Feedback)
介面元件： 「賽前裝備實驗室 (Gear Lab)」

實作方式： 提供幾個切換開關（Checkbox/Toggle），例如「怕熱、怕雨、追求速度」。當用戶切換時，下方的「建議清單」會立即改變（例如從長袖變背心）。

測試重點： 這種即時的回饋感是否讓他們覺得這個工具「很聰明、很懂我」？

4. 所有權與擁有感 (Ownership & Possession)
介面元件： 「個人跑步履歷 (The Runner CV)」

實作方式： 設計一個精美的個人檔案頁面，包含頭像、累計里程、PB 標籤。

測試重點： 跑者是否願意將這個頁面截圖分享到社群媒體？這代表他們對這份數據產生了歸屬感。

5. 社會影響力與關聯性 (Social Influence & Relatedness)
介面元件： 「賽道戰友榜 (Who's In?)」

實作方式： 在賽事詳情頁顯示「已有 15 位朋友關注此賽事」或模擬的評論區。

測試重點： 看到熟悉的社團名稱或跑友頭像出現在同一場賽事中，是否會增加他們報名的衝動？

6. 稀缺性與迫切感 (Scarcity & Impatience)
介面元件： 「報名截止倒數計時器 (Final Call)」

實作方式： 在熱門賽事卡片上加入一個閃爍的紅色倒數計時器（可用簡單 JS 實作）。

測試重點： 這種視覺上的迫切感是否讓他們更頻繁地回到網站確認資訊？

7. 未知性與好奇心 (Unpredictability & Curiosity)
介面元件： 「每日跑者驚喜包 (The Lucky Draw)」

實作方式： 放一個「點擊獲取今日賽事小知識」或「隨機推薦一場特色賽事」的按鈕，點擊後彈出視窗顯示驚喜內容。

測試重點： 這種不確定性是否能吸引用戶每天「回訪」網站，而不僅僅是報名時才來？

8. 損失與逃避 (Loss & Avoidance)
介面元件： 「連續週跑紀錄火苗 (Streak Counter)」

實作方式： 顯示「你已連續 4 週都有參賽紀錄！」並配上一個火苗圖示。如果本週沒紀錄，火苗看起來會變弱。

測試重點： 跑者是否會為了「維持火苗不熄滅」而產生上傳紀錄的動力？

------------------------------------------------------------------------------
RaceLink Taiwan：八角哲學組件開發指令 (Prompt List)
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills

1. 史詩意義 (Epic Meaning) - 「環島解鎖地圖」
「請在 components/Octalysis 下建立 TaiwanMissionMap.html。這是一個互動式的台灣 SVG 地圖，將台灣分為北、中、南、東、離島五區。請用 Tailwind 實作：

已跑過的區域顯示為『能量綠』並發光。

未跑過的區域顯示為『深灰色』。

滑鼠懸停 (Hover) 時顯示該區已完成的賽事數量。

風格要像遊戲的任務解鎖介面。」

2. 進度成就 (Accomplishment) - 「數位獎牌陳列櫃」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 MedalCabinet.html。這是一個 3xN 的響應式獎牌網格 (Grid)：

每個獎牌由一個圓形圖示、賽事名稱、完賽日期組成。

已獲得的獎牌要使用漸層色與浮雕陰影，展現真實質感。

未獲得的獎牌加上 grayscale 濾鏡與一個半透明的鎖頭圖示。

點擊獎牌時彈出該場賽事的 PB (個人最佳) 成績小視窗。」

3. 創意回饋 (Creativity) - 「智慧裝備實驗室」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 GearLab.html，網頁名稱為「裝備實驗室」。這是一個互動式清單：

左側提供三個切換開關 (Toggle)：『追求速度』、『怕熱體質』、『可能有雨』。

右側顯示裝備建議卡片。

當使用者切換左側選項時，右側卡片內容要立即產生 CSS 動態轉換，更新建議的跑鞋與服裝標籤。

這要展現出系統能根據跑者的選擇即時提供專業回饋。」

4. 所有權感 (Ownership) - 「跑者數位履歷」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 RunnerCV.html，網頁名稱為「跑者履歷」。這是一個展現個人跑步生涯的視覺化頁面：

頂部有大型頭像、等級（如：菁英跑者）與累計里程。

中間顯示三個核心數據方塊：全馬 PB、半馬 PB、完賽場次。

下方用一個簡單的 SVG 折線圖模擬過去半年的配速趨勢。

整體風格要像專業的運動數據 Dashboard，強調『這是我的成就』。」

5. 社會影響 (Social Influence) - 「賽道戰友榜」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 RaceBuddies.html 組件，網頁名稱為「賽道戰友」。

顯示文字：『已有 28 位跑友報名此賽事』。

下方橫向排列 5-8 個跑者的圓形大頭貼，重疊顯示。

加入一個『看看誰也跑這場』的按鈕。

設計一個簡單的評論區模板，展示其他跑者對該賽事的補給或路線評分。」

6. 稀缺迫切 (Scarcity) - 「報名截止倒數」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 RegistrationUrgency.html，網頁名稱為「報名截止倒數」。這是一個高對比的警告組件：

使用螢光紅與深黑底色。

包含一個大型的倒數計時數字（天:時:分:秒）。

下方顯示文字：『熱門賽事名額有限，目前已有 85% 跑者完成報名』。

右側有一個閃爍效果的『立即前往報名』按鈕。」

7. 未知好奇 (Curiosity) - 「每日跑者驚喜包」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 DailySurprise.html，網頁名稱為「每日跑者驚喜包」。這是一個位在側邊欄的互動卡片：

卡片外觀是一個帶有問號的禮物盒圖示，文字標題為『今日跑者小知識』。

點擊時觸發一個 Tailwind 動態 Modal，隨機展示一條賽道冷知識或隨機推薦一場特色賽事。

Modal 關閉前加入一個『明天再來看看』的提示。」

8. 損失逃避 (Loss Avoidance) - 「連跑紀錄火苗」
參考@PROJECT_CONTEXT.md 的八角哲學描述，配色以現在的專案風格為主，視覺設計使用 /ui-ux-pro-max skills， 「請在 components/Octalysis 下建立 StreakCounter.html，網頁名稱為「連跑紀錄火苗」。

在導覽列或顯眼處顯示一個火苗圖示。

旁邊顯示文字：『連續參賽紀錄：12 週』。

如果目前處於休賽期，火苗圖示要變為灰色，並提示：『本週尚未上傳紀錄，火苗即將熄滅！』。

利用視覺上的『失去感』驅動跑者上傳成績。」