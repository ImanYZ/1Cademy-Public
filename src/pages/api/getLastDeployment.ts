import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
const GITHUB_API_URL = "https://api.github.com";
const REPO_OWNER = "ImanYZ";
const REPO_NAME = "1Cademy-Public";
const BRANCH = "main";
const ACCESS_TOKEN = process.env.ONECADEMYCRED_GITHUB_ACCESS_TOKEN;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${BRANCH}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${ACCESS_TOKEN}`,
    },
  });
  const lastCommit = response.data[0];
  return res.json({ lastCommitTime: lastCommit.commit.committer.date });
}

export default handler;
