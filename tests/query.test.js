const gql = require("graphql-tag");
const createTestServer = require("./helper");
const FEED = gql`
  {
    feed {
      id
      message
      createdAt
      likes
      views
    }
  }
`;

const POSTS = gql`
  {
    posts {
      id
      message
      createdAt
      likes
      views
    }
  }
`;

describe("queries", () => {
  test("feed", async () => {
    const { query } = createTestServer({
      user: { id: 1 },
      models: {
        Post: {
          findMany: jest.fn(() => [{ id: 1, message: "hello", createdAt: 12345839, likes: 20, views: 300 }]),
        },
      },
    });

    const res = await query({ query: FEED });
    expect(res).toMatchSnapshot();
  });

  test("posts", async () => {
    const { query } = createTestServer({
      user: { id: "o8osACdhLw4uW4CzflBt4" },
      models: {
        Post: {
          findMany: jest.fn(() => [
            {
              id: "E1y84ywOMrh9Lw4UgBkUz",
              message: "Another message again",
              createdAt: "1589652763001",
              likes: 80,
              views: 100,
            },
            {
              id: "EYRxCSpmvLHGnbuvYIsoL",
              message: "Another message",
              createdAt: "1589652737837",
              likes: 20,
              views: 300,
            },
          ]),
        },
      },
    });
    const res = await query({ query: POSTS });
    expect(res).toMatchSnapshot();
  });
});
