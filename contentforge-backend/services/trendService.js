// services/trendService.js
// بيجيب trending searches من Google Trends RSS feed
// بيحفظ وقت آخر update في الـ DB نفسه — مش بيعتمد على setInterval

const https = require("https");
const { Trend } = require("../models");

const ONE_HOUR_MS = 60 * 60 * 1000;

// ── Fetch RSS from Google Trends ──────────────────────────────────────────────
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// ── Parse RSS XML ─────────────────────────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      block.match(/<title>(.*?)<\/title>/);
    const trafficMatch = block.match(
      /<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/,
    );

    if (titleMatch) {
      const tag = titleMatch[1].trim();
      const traffic = trafficMatch
        ? trafficMatch[1].replace(/[^0-9]/g, "")
        : "100";
      items.push({
        tag: tag.includes(" ") ? tag : "#" + tag,
        traffic: parseInt(traffic) || 100,
      });
    }
  }
  return items;
}

function calcChange(traffic, rank) {
  if (traffic > 500000) return "+" + Math.round(traffic / 10000) + "%";
  if (traffic > 100000) return "+" + Math.round(traffic / 2000) + "%";
  return "+" + Math.max(50, 200 - rank * 15) + "%";
}

// ── Fetch from Google and save to DB ─────────────────────────────────────────
async function fetchAndSaveTrends() {
  console.log("[TrendService] Fetching trends from Google Trends RSS...");
  const url = "https://trends.google.com/trending/rss?geo=EG";

  try {
    const xml = await fetchRSS(url);

    if (xml.trim().startsWith("<!doctype") || xml.trim().startsWith("<html")) {
      console.warn("[TrendService] Google returned HTML — using fallback");
      await saveFallbackTrends();
      return;
    }

    const items = parseRSS(xml);

    if (!items.length) {
      console.warn("[TrendService] No items parsed — using fallback");
      await saveFallbackTrends();
      return;
    }

    const trendDocs = items.slice(0, 10).map((item, i) => ({
      tag: item.tag,
      change: calcChange(item.traffic, i),
      velocity: Math.round(item.traffic / 1000) || 100 - i * 8,
      region: "EG",
      source: "google",
      lastUpdated: new Date(),
    }));

    await Trend.deleteMany({ source: "google", region: "EG" });
    await Trend.insertMany(trendDocs);
    console.log(
      `[TrendService] Saved ${trendDocs.length} trends at ${new Date().toLocaleTimeString()}`,
    );
  } catch (err) {
    console.error("[TrendService] Fetch failed:", err.message);
    await saveFallbackTrends();
  }
}

async function saveFallbackTrends() {
  const existing = await Trend.countDocuments({ region: "EG" });
  if (existing > 0) {
    console.log("[TrendService] Keeping existing DB trends");
    return;
  }
  const defaults = [
    {
      tag: "#رمضان_كريم",
      change: "+340%",
      velocity: 340,
      region: "EG",
      source: "manual",
    },
    {
      tag: "#قهوة_الصباح",
      change: "+89%",
      velocity: 89,
      region: "EG",
      source: "manual",
    },
    {
      tag: "Cold brew Egypt",
      change: "+210%",
      velocity: 210,
      region: "EG",
      source: "manual",
    },
    {
      tag: "#سحور",
      change: "+167%",
      velocity: 167,
      region: "EG",
      source: "manual",
    },
    {
      tag: "#إفطار",
      change: "+290%",
      velocity: 290,
      region: "EG",
      source: "manual",
    },
  ];
  await Trend.insertMany(defaults);
  console.log("[TrendService] Saved fallback trends to DB");
}

// ── Smart scheduler: بيشوف وقت آخر update في الـ DB ─────────────────────────
// لو السيرفر اتقفل ورجع تاني، بيشوف الـ DB ويحسب الوقت الباقي صح
async function runIfDue() {
  try {
    // جيب آخر trend اتحفظ في الـ DB
    const latest = await Trend.findOne({ region: "EG" }).sort({
      updatedAt: -1,
    });

    if (!latest) {
      // الـ DB فاضي — اجيب فوراً
      await fetchAndSaveTrends();
    } else {
      const msSinceUpdate = Date.now() - new Date(latest.updatedAt).getTime();

      if (msSinceUpdate >= ONE_HOUR_MS) {
        // فات أكتر من ساعة منذ آخر update في الـ DB
        console.log(
          `[TrendService] Last update was ${Math.round(msSinceUpdate / 60000)} min ago — fetching now`,
        );
        await fetchAndSaveTrends();
      } else {
        // لسه في الساعة — استنى الوقت الباقي بس
        const waitMs = ONE_HOUR_MS - msSinceUpdate;
        console.log(
          `[TrendService] Trends are fresh — next update in ${Math.round(waitMs / 60000)} min`,
        );
        // جدول الـ run الجاي بعد الوقت الباقي بالظبط
        setTimeout(runIfDue, waitMs);
        return;
      }
    }
  } catch (err) {
    console.error("[TrendService] Scheduler check failed:", err.message);
  }

  // بعد ما الـ fetch يخلص، جدول الـ run الجاي بعد ساعة كاملة
  setTimeout(runIfDue, ONE_HOUR_MS);
}

function startTrendScheduler() {
  console.log(
    "[TrendService] Scheduler started — checks DB timestamp on every boot",
  );
  runIfDue();
}

module.exports = { startTrendScheduler, fetchAndSaveTrends };
