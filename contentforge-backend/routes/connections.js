const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Connection } = require("../models");
const axios = require("axios");

const API_VERSION = process.env.META_API_VERSION || "v25.0";

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
  return data.access_token;
}

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

router.get("/", protect, async (req, res) => {
  try {
    const connections = await Connection.find({ user: req.user._id });
    res.json({ connections });
  } catch (err) {
    console.error("[Connections] GET error:", err.message);
    res.status(500).json({ message: "Failed to fetch connections" });
  }
});

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

router.get("/meta/callback", async (req, res) => {
  const { code, state: userId } = req.query;

  try {
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

    const longLivedUserToken = await exchangeForLongLivedToken(shortLivedToken);

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
      const pageToken = await getPageToken(page.id, longLivedUserToken);

      const igRes = await axios.get(
        `https://graph.facebook.com/${API_VERSION}/${page.id}`,
        {
          params: {
            fields:
              "name,fan_count,feed.limit(1).summary(true),instagram_business_account{id,username,followers_count,media_count}",
            access_token: pageToken,
          },
        },
      );

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
            value: igRes.data.feed?.summary?.total_count || 0,
          },
        ],
        rawData: { pageId: page.id, pageToken },
      });

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

router.post("/instagram/post", protect, async (req, res) => {
  const { imageUrl, caption } = req.body;

  const conn = await Connection.findOne({
    user: req.user._id,
    platform: "Instagram",
  });
  if (!conn)
    return res.status(404).json({ message: "Instagram not connected" });

  const containerRes = await axios.post(
    `https://graph.facebook.com/${API_VERSION}/${conn.igId}/media`,
    {
      image_url: imageUrl, 
      caption,
      access_token: conn.accessToken,
    },
  );

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