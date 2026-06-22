const https = require("https");
const { Trend } = require("../models");

const ONE_HOUR_MS = 60 * 60 * 1000;

// 🗺️ Mapping بين اللهجات والمناطق
const DIALECT_REGION_MAP = {
  "Egyptian Arabic": "EG",
  "Gulf Arabic": "SA",
  "Levantine Arabic": "LB",
  "Modern Standard Arabic": "EG",
  "Bilingual AR+EN": "EG",
};

function getRegionForDialect(dialect) {
  return DIALECT_REGION_MAP[dialect] || "EG";
}

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

// ✅ تعديل: يقبل region كـ parameter
async function fetchAndSaveTrends(region = "EG") {
  console.log(`[TrendService] Fetching trends for region: ${region}...`);
  const url = `https://trends.google.com/trending/rss?geo=${region}`;

  try {
    const xml = await fetchRSS(url);

    if (xml.trim().startsWith("<!doctype") || xml.trim().startsWith("<html")) {
      console.warn(
        `[TrendService] Google returned HTML for ${region} — using fallback`,
      );
      await saveFallbackTrends(region);
      return;
    }

    const items = parseRSS(xml);

    if (!items.length) {
      console.warn(
        `[TrendService] No items parsed for ${region} — using fallback`,
      );
      await saveFallbackTrends(region);
      return;
    }

    const trendDocs = items
      .slice(0, 10)
      .sort((a, b) => b.traffic - a.traffic)
      .map((item, i) => ({
        tag: item.tag,
        change: calcChange(item.traffic, i),
        velocity: Math.round(item.traffic / 1000) || 100 - i * 8,
        region: region,
        source: "google",
        lastUpdated: new Date(),
      }));

    await Trend.deleteMany({ region: region });
    await Trend.insertMany(trendDocs);
    console.log(
      `[TrendService] Saved ${trendDocs.length} trends for ${region} at ${new Date().toLocaleTimeString()}`,
    );
  } catch (err) {
    console.error(`[TrendService] Fetch failed for ${region}:`, err.message);
    await saveFallbackTrends(region);
  }
}

// ✅ تعديل: fallbacks مختلفة لكل منطقة
async function saveFallbackTrends(region = "EG") {
  const existing = await Trend.countDocuments({ region: region });
  if (existing > 0) {
    console.log(`[TrendService] Keeping existing DB trends for ${region}`);
    return;
  }

  const fallbacks = {
    EG: [
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
    ],
    SA: [
      {
        tag: "#السعودية",
        change: "+250%",
        velocity: 250,
        region: "SA",
        source: "manual",
      },
      {
        tag: "#رؤية_2030",
        change: "+180%",
        velocity: 180,
        region: "SA",
        source: "manual",
      },
      {
        tag: "#الرياض",
        change: "+320%",
        velocity: 320,
        region: "SA",
        source: "manual",
      },
      {
        tag: "#كأس_العالم",
        change: "+410%",
        velocity: 410,
        region: "SA",
        source: "manual",
      },
      {
        tag: "#نيوم",
        change: "+195%",
        velocity: 195,
        region: "SA",
        source: "manual",
      },
    ],
    LB: [
      {
        tag: "#لبنان",
        change: "+200%",
        velocity: 200,
        region: "LB",
        source: "manual",
      },
      {
        tag: "#بيروت",
        change: "+175%",
        velocity: 175,
        region: "LB",
        source: "manual",
      },
      {
        tag: "#صباح_الخير",
        change: "+120%",
        velocity: 120,
        region: "LB",
        source: "manual",
      },
      {
        tag: "#الشرق_الأوسط",
        change: "+280%",
        velocity: 280,
        region: "LB",
        source: "manual",
      },
      {
        tag: "#ثقافة",
        change: "+95%",
        velocity: 95,
        region: "LB",
        source: "manual",
      },
    ],
  };

  const defaults = fallbacks[region] || fallbacks.EG;
  await Trend.insertMany(defaults);
  console.log(`[TrendService] Saved fallback trends for ${region} to DB`);
}

// ✅ تعديل: يقبل region
async function runIfDue(region = "EG") {
  try {
    const latest = await Trend.findOne({ region: region }).sort({
      updatedAt: -1,
    });

    if (!latest) {
      await fetchAndSaveTrends(region);
    } else {
      const msSinceUpdate = Date.now() - new Date(latest.updatedAt).getTime();

      if (msSinceUpdate >= ONE_HOUR_MS) {
        console.log(
          `[TrendService] Last update for ${region} was ${Math.round(msSinceUpdate / 60000)} min ago — fetching now`,
        );
        await fetchAndSaveTrends(region);
      } else {
        const waitMs = ONE_HOUR_MS - msSinceUpdate;
        console.log(
          `[TrendService] Trends for ${region} are fresh — next update in ${Math.round(waitMs / 60000)} min`,
        );
        setTimeout(() => runIfDue(region), waitMs);
        return;
      }
    }
  } catch (err) {
    console.error(
      `[TrendService] Scheduler check failed for ${region}:`,
      err.message,
    );
  }

  setTimeout(() => runIfDue(region), ONE_HOUR_MS);
}

function startTrendScheduler() {
  console.log(
    "[TrendService] Scheduler started — checks DB timestamp on every boot",
  );
  runIfDue("EG"); // Default region
}

module.exports = {
  startTrendScheduler,
  fetchAndSaveTrends,
  getRegionForDialect,
  DIALECT_REGION_MAP,
};