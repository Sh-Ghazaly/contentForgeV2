// backend/routes/posts.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { User, TopPost } = require("../models");
const { Post, Brand, Calendar } = require("../models");
const { generateVariantB } = require("../services/geminiService");
const { uploadBase64Image } = require("../utils/uploadToCloudinary");
const { Connection } = require("../models");
const {
  checkPosterLimit,
  checkPostsLimit,
  incrementUsage,
} = require("../middleware/subscription");
const axios = require("axios");

const API_VERSION = process.env.META_API_VERSION || "v25.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

async function getConnection(userId, platform) {
  return Connection.findOne({
    user: userId,
    platform: new RegExp("^" + platform + "$", "i"),
    connected: true,
  });
}

router.get("/stats/facebook", protect, async (req, res) => {
  try {
    const conn = await getConnection(req.user._id, "Facebook");
    if (!conn)
      return res.status(400).json({ message: "Facebook not connected" });

    const { data } = await axios.get(`${BASE_URL}/${conn.pageId}`, {
  params: {
    fields: "name,fan_count,feed.limit(100).summary(true)",
    access_token: conn.accessToken,
  },
});

res.json({
  pageName: data.name,
  followers: data.fan_count ?? 0,
  totalPosts: data.feed?.data?.length ?? 0,
  likes: data.fan_count ?? 0,
  reach: Math.floor((data.fan_count ?? 0) * 1.3) || 6,
});
  } catch (err) {
    console.error("[Facebook Stats] error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch Facebook stats" });
  }
});
router.get("/stats/instagram", protect, async (req, res) => {
  try {
    const conn = await getConnection(req.user._id, "Instagram");
    if (!conn)
      return res.status(400).json({ message: "Instagram not connected" });

    const { data } = await axios.get(`${BASE_URL}/${conn.igId}`, {
      params: {
        fields:
          "username,followers_count,follows_count,media_count,media.limit(5){caption,like_count,comments_count,timestamp}",
        access_token: conn.accessToken,
      },
    });

    const igInsightsRes = await axios.get(`${BASE_URL}/${conn.igId}/insights`, {
      params: {
        metric: "reach",
        period: "day",
        access_token: conn.accessToken,
      },
    });

    const reach =
      igInsightsRes.data.data
        ?.find((m) => m.name === "reach")
        ?.values?.slice(-1)[0]?.value ?? 0;

    res.json({
      username: data.username,
      followers: data.followers_count,
      following: data.follows_count,
      totalPosts: data.media_count,
      reach,
      recentPosts:
        data.media?.data?.map((p) => ({
          id: p.id,
          caption: p.caption,
          likes: p.like_count,
          comments: p.comments_count,
        })) || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Instagram stats" });
  }
});
const { generatePostImage } = require("../services/imageService");

router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;
  const valid = [
    "draft",
    "pending_review",
    "approved",
    "scheduled",
    "published",
  ];
  if (!valid.includes(status))
    return res.status(400).json({ message: "Invalid status value" });

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.patch("/:id/approve", protect, async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.patch("/:id", protect, async (req, res) => {
  const allowed = [
    "copyAR",
    "copyEN",
    "hashtags",
    "imagePrompt",
    "status",
    "scheduledAt",
    "platform",
  ];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const post = await Post.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.post("/:id/variant-b", protect, checkPostsLimit, async (req, res) => {
  const post = await Post.findById(req.params.id).populate("brand");
  if (!post) return res.status(404).json({ message: "Post not found" });

  const topPosts = await TopPost.find({ brand: post.brand._id })
    .sort("-stats.engagementRate")
    .limit(3);

  const variantB = await generateVariantB({
    post,
    brand: post.brand,
    topPosts,
  });

  post.variantB = variantB;

  await post.save();

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "usage.postsGenerated": 1 },
  });

  res.json(variantB);
});

router.post("/:id/apply-variant-b", protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || !post.variantB)
    return res.status(404).json({ message: "Post or variant not found" });

  post.copyAR = post.variantB.copyAR;
  post.copyEN = post.variantB.copyEN;
  post.hashtags = post.variantB.hashtags;
  post.variantB = undefined;
  await post.save();
  res.json(post);
});


router.patch("/:id/schedule", protect, async (req, res) => {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt date is required" });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        scheduledAt: new Date(scheduledAt),
        date: scheduledAt.substring(0, 10),
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error updating post date:", error);
    res
      .status(500)
      .json({ message: "Server error updating scheduling window" });
  }
});

router.get("/all/:brandId", protect, async (req, res) => {
  const posts = await Post.find({ brand: req.params.brandId }).sort(
    "-createdAt",
  );
  res.json(posts);
});

router.get("/drafts/:brandId", protect, async (req, res) => {
  const drafts = await Post.find({
    brand: req.params.brandId,
    status: { $in: ["draft", "pending_review"] },
  }).sort("-createdAt");
  res.json(drafts);
});

router.delete("/:id", protect, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

router.patch("/:id/date", protect, async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ message: "date is required" });

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { date: new Date(date) },
    { new: true },
  );
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.post(
  "/:id/generate-image",
  protect,
  checkPosterLimit,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const brand = await Brand.findById(post.brand);
      if (!brand) return res.status(404).json({ message: "Brand not found" });

      const isRegenerate = !!post.imageUrl; 

      console.log(
        `[Posts] ${isRegenerate ? "Regenerating" : "Generating"} image for post ${post._id} (${post.platform})`,
      );

      if (isRegenerate) {
        post.imagePrompt = null;
      }

      const { imagePrompt, imageUrl } = await generatePostImage({
        post,
        brand,
        regenerate: isRegenerate, 
      });

      if (!imageUrl) {
        return res.status(503).json({
          message: "Image generation not available — set HF_API_TOKEN in .env",
        });
      }

      post.imagePrompt = imagePrompt;
      post.imageUrl = imageUrl;
      await post.save();

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "usage.aiImagesGenerated": 1 },
      });

      res.json({
        message: isRegenerate
          ? "Image regenerated successfully"
          : "Image generated successfully",
        imageUrl,
        imagePrompt,
        regenerated: isRegenerate,
      });
    } catch (err) {
      console.error("[Posts] Image generation error:", err.message);
      res
        .status(500)
        .json({ message: "Image generation failed: " + err.message });
    }
  },
);


router.post("/:id/publish/instagram", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const conn = await getConnection(req.user._id, "Instagram");
    if (!conn)
      return res.status(400).json({ message: "Instagram not connected" });

    if (!post.imageUrl) {
      return res
        .status(400)
        .json({ message: "Instagram posts require an image" });
    }

    const caption =
      (post.copyEN || post.copyAR || "") +
      (post.hashtags?.length ? "\n\n" + post.hashtags.join(" ") : "");

    let imageUrl = post.imageUrl;
    if (imageUrl?.startsWith("data:image")) {
      imageUrl = await uploadBase64Image(imageUrl);
      post.imageUrl = imageUrl;
    }

    const { data: igContainer } = await axios.post(
      `${BASE_URL}/${conn.igId}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption,
          access_token: conn.accessToken,
        },
      },
    );

    const { data: igPublished } = await axios.post(
      `${BASE_URL}/${conn.igId}/media_publish`,
      null,
      {
        params: { creation_id: igContainer.id, access_token: conn.accessToken },
      },
    );

    post.status = "published";
    post.publishedAt = new Date();
    post.metaPostId = igPublished.id;
    await post.save();

    res.json({ success: true, postId: igPublished.id, platform: "Instagram" });
  } catch (err) {
    console.error(
      "[Instagram Publish] Error:",
      err.response?.data || err.message,
    );
    res.status(500).json({
      message:
        err.response?.data?.error?.message || "Failed to publish to Instagram",
    });
  }
});
router.post("/:id/publish/facebook", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const conn = await getConnection(req.user._id, "Facebook");
    if (!conn)
      return res.status(400).json({ message: "Facebook not connected" });

    const message = post.copyAR || post.copyEN || "";
    const hashtags = post.hashtags ? post.hashtags.join(" ") : "";
    const fullMessage = message + (hashtags ? "\n\n" + hashtags : "");

    let imageUrl = post.imageUrl;
    if (imageUrl?.startsWith("data:image")) {
      imageUrl = await uploadBase64Image(imageUrl);
      post.imageUrl = imageUrl;
    }
    const params = {
      access_token: conn.accessToken,
      message: fullMessage,
      ...(imageUrl && { link: imageUrl }),
    };

    const { data } = await axios.post(`${BASE_URL}/${conn.pageId}/feed`, null, {
      params,
    });

    post.status = "published";
    post.publishedAt = new Date();
    post.metaPostId = data.id;
    await post.save();

    res.json({ success: true, postId: data.id, platform: "Facebook" });
  } catch (err) {
    console.error(
      "[Facebook Publish] Error:",
      err.response?.data || err.message,
    );
    res.status(500).json({
      message:
        err.response?.data?.error?.message || "Failed to publish to Facebook",
    });
  }
});

console.log("=== POSTS ROUTES ===");
router.stack.forEach((layer) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
    console.log(`  ${methods} ${layer.route.path}`);
  }
});

router.post("/", protect, checkPostsLimit, async (req, res) => {
  try {
    const {
      brand,
      calendar,
      dialect,
      platform,
      copyAR,
      copyEN,
      hashtags,
      status,
      date,
      scheduledAt,
      scheduledDate,
    } = req.body;

    if (!brand) {
      return res.status(400).json({ message: "Brand ID is required" });
    }

    const resolvedDate = scheduledDate || scheduledAt || date;
    const dateObj = resolvedDate ? new Date(resolvedDate) : new Date();
    const dateStr = dateObj.toISOString().split("T")[0];

    const newPost = new Post({
      brand,
      calendar,
      dialect: dialect || "Egyptian Arabic",
      platform: platform || "Instagram",
      copyAR: copyAR || "",
      copyEN: copyEN || "",
      hashtags: hashtags || [],
      status: status || "draft",
      date: dateStr,
      scheduledAt: dateObj,
    });

    await newPost.save();

    if (calendar) {
      const calendarDoc = await Calendar.findById(calendar);
      
      if (calendarDoc) {
        if (dateObj > calendarDoc.endDate) {
          calendarDoc.endDate = dateObj;
          console.log(
            `[Calendar] Extended endDate to ${dateStr} for calendar ${calendar}`
          );
        }
        
        calendarDoc.posts.push(newPost._id);
        await calendarDoc.save();
        
        console.log(
          `[Calendar] Linked post ${newPost._id} to calendar ${calendar}`
        );
      }
    }

    console.log(`[Posts] Created new post successfully: ${newPost._id}`);

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "usage.postsGenerated": 1 },
    });
    
    res.status(201).json(newPost);
  } catch (err) {
    console.error("[Posts Create] Error:", err.message);
    res
      .status(500)
      .json({ message: "Server error creating post: " + err.message });
  }
});

module.exports = router;
