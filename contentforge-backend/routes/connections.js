const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Connection } = require("../models");
const axios = require("axios");

const API_VERSION = process.env.META_API_VERSION || "v25.0";

// ── Helper: Exchange short-lived → long-lived user token ─────────
async function exchangeForLongLivedToken(shortLivedToken) {
  const { data } = await axios.get(
    `https://graph.facebook.com/${API_VERSION}/oauth/access_token`,
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    },
  );
  return data.access_token; // 60-day token
}

// ── Helper: Get never-expiring page token ────────────────────────
async function getPageToken(pageId, longLivedUserToken) {
  const { data } = await axios.get(
    `https://graph.facebook.com/${API_VERSION}/${pageId}`,
    {
      params: {
        fields: "access_token",
        access_token: longLivedUserToken,
      },
    },
  );
  return data.access_token;
}

// GET /api/connections — get all connections for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const connections = await Connection.find({ user: req.user._id });
    res.json({ connections });
  } catch (err) {
    console.error("[Connections] GET error:", err.message);
    res.status(500).json({ message: "Failed to fetch connections" });
  }
});

// GET /api/connections/meta/auth — generate OAuth URL
router.get("/meta/auth", protect, (req, res) => {
  const scopes = [
    "public_profile",
    "business_management",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
    "pages_manage_posts",
    "instagram_basic",
    "instagram_manage_insights",
    "instagram_content_publish",
    "instagram_manage_comments",
    "read_insights",
    "email",
  ].join(",");

  const authUrl =
    `https://www.facebook.com/dialog/oauth?` +
    `client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    `&scope=${scopes}` +
    `&state=${req.user._id}` +
    `&response_type=code`;

  res.json({ authUrl });
});

// GET /api/connections/meta/callback — Meta redirects here
router.get("/meta/callback", async (req, res) => {
  const { code, state: userId } = req.query;

  try {
    // 1. Exchange code for short-lived user token
    const tokenRes = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/oauth/access_token`,
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          code,
        },
      },
    );

    const shortLivedToken = tokenRes.data.access_token;
    if (!shortLivedToken) throw new Error("No access token from Meta");

    // 2. Exchange for LONG-LIVED user token (60 days)
    const longLivedUserToken = await exchangeForLongLivedToken(shortLivedToken);

    // 3. Get user pages
    const pagesRes = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/me/accounts`,
      {
        params: {
          fields: "id,name,fan_count,followers_count",
          access_token: longLivedUserToken,
        },
      },
    );
    console.log("[Meta Callback] Pages found:", JSON.stringify(pagesRes.data));

    let pages = pagesRes.data.data || [];
    // If empty, try fetching via businesses
    if (pages.length === 0) {
      const businessRes = await axios.get(
        `https://graph.facebook.com/${API_VERSION}/me/businesses`,
        { params: { access_token: longLivedUserToken } },
      );
      const businesses = businessRes.data.data || [];

      for (const business of businesses) {
        const bizPagesRes = await axios.get(
          `https://graph.facebook.com/${API_VERSION}/${business.id}/owned_pages`,
          {
            params: {
              fields: "id,name,fan_count,followers_count",
              access_token: longLivedUserToken,
            },
          },
        );
        pages = [...pages, ...(bizPagesRes.data.data || [])];
      }
    }

    console.log("[Meta Callback] Pages found:", JSON.stringify(pages));

    if (pages.length === 0) {
      return res.redirect(
        `${process.env.CLIENT_URL}/connections?error=no_pages`,
      );
    }

    const connections = [];

    for (const page of pages) {
      // 4. Get NEVER-EXPIRING page token
      const pageToken = await getPageToken(page.id, longLivedUserToken);

      // 5. Get Instagram Business Account linked to this page
      const igRes = await axios.get(
        `https://graph.facebook.com/${API_VERSION}/${page.id}`,
        {
          params: {
      fields: "name,fan_count,feed.limit(1).summary(true),instagram_business_account{id,username,followers_count,media_count}",
            access_token: pageToken,
          },
        },
      );

      // Facebook connection
      connections.push({
        platform: "Facebook",
        handle: page.name,
        pageId: page.id,
        accessToken: pageToken,
        tokenType: "page",
        connected: true,
        stats: [
          { label: "Followers", value: page.fan_count || 0 },
          {
            label: "Posts",
            value: igRes.data.feed?.summary?.total_count || 0 },
        ],
        rawData: { pageId: page.id, pageToken },
      });

      // Instagram connection (if linked)
      if (igRes.data.instagram_business_account) {
        const ig = igRes.data.instagram_business_account;
        connections.push({
          platform: "Instagram",
          handle: ig.username,
          igId: ig.id,
          pageId: page.id,
          accessToken: longLivedUserToken,
          tokenType: "user",
          connected: true,
          stats: [
            {
              label: "Followers",
              value: (ig.followers_count || 0).toLocaleString(),
            },
            { label: "Posts", value: (ig.media_count || 0).toLocaleString() },
          ],
          rawData: {
            igId: ig.id,
            pageId: page.id,
            userToken: longLivedUserToken,
          },
        });
      }
    }

    // 6. Save to database (upsert — replace old connections)
    for (const conn of connections) {
      await Connection.findOneAndUpdate(
        { user: userId, platform: conn.platform },
        { user: userId, ...conn },
        { upsert: true, new: true },
      );
    }

    res.redirect(`${process.env.CLIENT_URL}/connections?success=true`);
  } catch (err) {
    console.error(
      "[Meta OAuth] Callback error:",
      err.response?.data || err.message,
    );
    res.redirect(
      `${process.env.CLIENT_URL}/connections?error=${encodeURIComponent(err.message)}`,
    );
  }
});

// DELETE /api/connections/:platform — disconnect
router.delete("/:platform", protect, async (req, res) => {
  try {
    await Connection.deleteOne({
      user: req.user._id,
      platform: new RegExp("^" + req.params.platform + "$", "i"),
    });
    res.json({ message: "Disconnected successfully" });
  } catch (err) {
    console.error("[Connections] DELETE error:", err.message);
    res.status(500).json({ message: "Failed to disconnect" });
  }
});
// POST /api/connections/facebook/post
router.post("/facebook/post", protect, async (req, res) => {
  const { message } = req.body;

  const conn = await Connection.findOne({
    user: req.user._id,
    platform: "Facebook",
  });
  if (!conn) return res.status(404).json({ message: "Facebook not connected" });

  const result = await axios.post(
    `https://graph.facebook.com/${API_VERSION}/${conn.pageId}/feed`,
    { message, access_token: conn.accessToken },
  );

  res.json({ success: true, postId: result.data.id });
});

// POST /api/connections/instagram/post
router.post("/instagram/post", protect, async (req, res) => {
  const { imageUrl, caption } = req.body;

  const conn = await Connection.findOne({
    user: req.user._id,
    platform: "Instagram",
  });
  if (!conn)
    return res.status(404).json({ message: "Instagram not connected" });

  // Step 1: Create media container
  const containerRes = await axios.post(
    `https://graph.facebook.com/${API_VERSION}/${conn.igId}/media`,
    {
      image_url: imageUrl, // must be a public URL
      caption,
      access_token: conn.accessToken,
    },
  );

  // Step 2: Publish it
  const publishRes = await axios.post(
    `https://graph.facebook.com/${API_VERSION}/${conn.igId}/media_publish`,
    {
      creation_id: containerRes.data.id,
      access_token: conn.accessToken,
    },
  );

  res.json({ success: true, postId: publishRes.data.id });
});

module.exports = router;

// Table
// Permission	Status	Purpose
// instagram_basic	✅ -->	Read Instagram Business profile & media
// instagram_manage_insights	✅ -->	Read Instagram reach, impressions, likes, comments
// instagram_content_publish	✅ -->	Publish posts to Instagram
// instagram_manage_comments	✅ -->	Read/reply to Instagram comments
// instagram_manage_messages	✅ -->	Read Instagram DMs
// instagram_manage_comments	✅ -->	Manage Instagram comments
// instagram_content_publish	✅ -->	Publish to Instagram (legacy)
// pages_show_list	✅ -->	List user's Facebook Pages
// pages_read_engagement	✅ -->	Read Page posts, followers, engagement
// pages_manage_posts	✅ -->	Publish posts to Facebook Page
// pages_manage_metadata	✅ -->	Manage Page info/settings
// read_insights	✅ -->	Read Page analytics
// email	✅ -->	Get user's email
// public_profile	✅ -->	Basic Facebook profile info

// test manually
// # 1. Get auth URL (replace TOKEN with your JWT)
// curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
//   http://localhost:3000/api/connections/meta/auth

// # 2. Test callback manually (after getting code from browser)
// curl "http://localhost:3000/api/connections/meta/callback?code=XXX&state=USER_ID"
