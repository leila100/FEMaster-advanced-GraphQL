const { ApolloServer, SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const typeDefs = require("./typedefs");
const resolvers = require("./resolvers");
const { createToken, getUserFromToken } = require("./auth");
const db = require("./db");

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    field.args.push({
      type: GraphQLString,
      name: "message",
    });
    field.resolve = (root, { message, ...rest }, ctx, info) => {
      const { message: schemaMessage } = this.args;
      // message comes from the args @log(message: ---)
      // schemaMessage comes from the query id(message: ---)
      console.log(`✨ Hi -- ${message || schemaMessage}`);
      return resolver.call(this, root, rest, ctx, info);
    };
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
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
