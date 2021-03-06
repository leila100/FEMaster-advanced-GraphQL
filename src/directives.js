const { SchemaDirectiveVisitor, AuthenticationError } = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const { formatDate } = require("./utils");

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

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    field.args.push({
      type: GraphQLString,
      name: "format",
    });
    field.resolve = async (root, { format, ...rest }, ctx, info) => {
      const { format: schemaFormat } = this.args;
      const result = await resolver.call(this, root, rest, ctx, info);
      return formatDate(result, format || schemaFormat);
    };
    field.type = GraphQLString;
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    field.resolve = async (root, args, ctx, info) => {
      if (!ctx.user) throw new AuthenticationError("You are not authenticated");
      return resolver(root, args, ctx, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { role } = this.args;
    console.log("role: ", role);
    field.resolve = async (root, args, ctx, info) => {
      if (ctx.user.role !== role) throw new AuthenticationError("You are not authorized");
      return resolver(root, args, ctx, info);
    };
  }
}

module.exports = { LogDirective, FormatDateDirective, AuthenticationDirective, AuthorizationDirective };
