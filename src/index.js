const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { createToken, getUserFromToken } = require("./auth");
const db = require("./db");
const { LogDirective, FormatDateDirective } = require("./directives");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
    formatDate: FormatDateDirective,
  },
  context({ req, connection }) {
    const context = { ...db };
    if (connection) return { context, ...connection.context };
    const token = req.headers.authorization;
    const user = getUserFromToken(token);
    return { ...context, user, createToken };
  },
  subscriptions: {
    onConnect(connectionParams) {
      if (connectionParams.auth) {
        const user = getUserFromToken(connectionParams.auth);

        if (!user) {
          throw new AuthenticationError("not authenticated");
        }

        return { user };
      }

      throw new AuthenticationError("not authenticated");
    },
  },
});

server.listen(4000).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
