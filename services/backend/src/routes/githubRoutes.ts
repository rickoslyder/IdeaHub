import express from "express";
import githubService from "../services/githubService.js";

const router = express.Router();

/**
 * @route GET /api/github/repo
 * @desc Get repository metadata from GitHub URL
 */
router.get("/repo", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ message: "GitHub repository URL is required" });
    }

    const repoMetadata = await githubService.getRepoMetadata(url);

    if (!repoMetadata) {
      return res.status(404).json({ message: "GitHub repository not found" });
    }

    return res.json(repoMetadata);
  } catch (error) {
    console.error("Error fetching GitHub repository metadata:", error);
    return res.status(500).json({
      message: "Failed to fetch GitHub repository metadata",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * @route GET /api/github/commits
 * @desc Get latest commits from GitHub repository
 */
router.get("/commits", async (req, res) => {
  try {
    const { url, limit } = req.query;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ message: "GitHub repository URL is required" });
    }

    const commitLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 5;

    const commits = await githubService.getLatestCommits(url, commitLimit);

    return res.json(commits);
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    return res.status(500).json({
      message: "Failed to fetch GitHub commits",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
