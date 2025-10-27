import { GITHUB_TOKEN } from "$env/static/private";

/**
 * @param {string} query
 * @param {(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>} fetch
 * @param {object} [variables]
 */
const fetcher = async (query, fetch, variables) => {
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`GitHub API error: ${res.status} ${res.statusText}, Body: ${errorBody}`);
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const { data } = await res.json();
    if (!data) {
      console.error("GitHub API returned no data:", data);
      throw new Error("GitHub API returned no data");
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default fetcher;
