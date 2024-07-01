import axios from "axios";
const GITHUB_API_URL = "https://api.github.com";
const REPO_OWNER = "ImanYZ";
const REPO_NAME = "1Cademy-Public";
const BRANCH = "main";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

export const getLastDeploymentTime = async () => {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${BRANCH}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${ACCESS_TOKEN}`,
    },
  });
  const lastCommit = response.data[0];
  return lastCommit.commit.committer.date;
};
