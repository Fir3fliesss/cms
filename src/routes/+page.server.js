import fetcher from "$lib/fetcher";
import slugify from "@sindresorhus/slugify";

const query = `{
  repository(name: "github-cms", owner: "SynchronizesTeams") {
    discussions(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
    nodes {
        title
        number
        createdAt
      }
    }
  }
}`;

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
  try {
    const res = await fetcher(query, fetch, {});
    const {
      repository: {
        discussions: { nodes },
      },
    } = res;
    nodes.map((/** @type {{ title: string; number: number; createdAt: string; slug: string; }} */ node) => {
      node.slug = slugify(node.title);
    });

    return {
      nodes,
    };
  } catch (error) {
    console.error("Error in load function:", error);
    return { nodes: [] };
  }
}
