const gql = require("graphql-tag");
const createTestServer = require("./helper");

const CREATE_POST = gql`
  mutation {
    createPost(input: { message: "This is a message" }) {
      id
      message
      createdAt
      likes
      views
    }
  }
`;

describe("mutations", () => {
  test("create post", async () => {
    const { mutate } = createTestServer({
      user: { id: 1 },
      models: {
        Post: {
          createOne: jest.fn(() => {
            return { id: 1, message: "This is a message", createdAt: 12345839, likes: 20, views: 300 };
          }),
        },
      },
    });

    const res = await mutate({ mutation: CREATE_POST });
    expect(res).toMatchSnapshot();
  });
});
