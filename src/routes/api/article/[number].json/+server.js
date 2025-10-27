import fetcher from "$lib/fetcher";
import { json } from "@sveltejs/kit";

const query = `query GetDiscussion($number: Int!) {
  repository(name: "github-cms", owner: "SynchronizesTeams") {
    discussion(number: $number) {
      bodyHTML
      title
      createdAt
      author {
        login
        avatarUrl
      }
    }
  }
}`;

export const GET = async ({ params: { number }, fetch, setHeaders }) => {
  const variables = {
    number: parseInt(number),
  };
  try {
    const {
      repository: { discussion },
    } = await fetcher(query, fetch, variables);

    setHeaders({
      "cache-control": "max-age=600",
    });

    return json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return json(
      { error: 'Failed to fetch discussion', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
};
