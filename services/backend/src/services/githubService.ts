import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// GitHub API base URL
const GITHUB_API_URL = "https://api.github.com";

// GitHub API token (optional, increases rate limits)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// GitHub API types
interface GithubRepoResponse {
  name: string;
  description: string;
  html_url: string;
  updated_at: string;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
}

interface GithubRepoMetadata {
  name: string;
  description: string;
  url: string;
  lastUpdated: string;
  language: string;
  owner: {
    username: string;
    avatarUrl: string;
  };
  stars: number;
  forks: number;
}

// Type for commit data
interface GithubCommitResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface GithubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

class GithubService {
  private baseUrl = GITHUB_API_URL;
  private token?: string;

  constructor() {
    // Load GitHub token from environment if available
    this.token = GITHUB_TOKEN;
  }

  /**
   * Extract owner and repo name from a GitHub URL
   */
  private parseGithubUrl(url: string): { owner: string; repo: string } | null {
    // Match patterns like https://github.com/owner/repo
    const githubUrlPattern = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(githubUrlPattern);

    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2].replace(".git", ""), // Remove .git if present
    };
  }

  /**
   * Get repository metadata from a GitHub URL
   */
  async getRepoMetadata(repoUrl: string): Promise<GithubRepoMetadata | null> {
    const parsedUrl = this.parseGithubUrl(repoUrl);

    if (!parsedUrl) {
      throw new Error("Invalid GitHub repository URL");
    }

    try {
      const { owner, repo } = parsedUrl;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      // Add authorization if token is available
      if (this.token) {
        headers["Authorization"] = `token ${this.token}`;
      }

      const response = await axios.get<GithubRepoResponse>(
        `${this.baseUrl}/repos/${owner}/${repo}`,
        { headers }
      );

      // Transform the response
      const data = response.data;
      return {
        name: data.name,
        description: data.description || "",
        url: data.html_url,
        lastUpdated: data.updated_at,
        language: data.language || "Unknown",
        owner: {
          username: data.owner.login,
          avatarUrl: data.owner.avatar_url,
        },
        stars: data.stargazers_count,
        forks: data.forks_count,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Repository not found
      }
      throw error;
    }
  }

  /**
   * Get latest commits for a repository
   */
  async getLatestCommits(
    repoUrl: string,
    limit: number = 5
  ): Promise<GithubCommit[]> {
    const parsedUrl = this.parseGithubUrl(repoUrl);

    if (!parsedUrl) {
      throw new Error("Invalid GitHub repository URL");
    }

    try {
      const { owner, repo } = parsedUrl;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      // Add authorization if token is available
      if (this.token) {
        headers["Authorization"] = `token ${this.token}`;
      }

      const response = await axios.get<GithubCommitResponse[]>(
        `${this.baseUrl}/repos/${owner}/${repo}/commits`,
        {
          headers,
          params: { per_page: limit },
        }
      );

      // Transform the commits response
      return response.data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return []; // Repository not found
      }
      throw error;
    }
  }
}

export default new GithubService();
