router.post("/generate-poster", upload.single("image"), generatePoster);
