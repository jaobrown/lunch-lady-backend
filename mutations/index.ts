import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import sendTextMessage from './sendTextMessage';

// fake graphql tagged template literal
const graphql = String.raw;

export const extendGraphqlSchema = graphQLSchemaExtension({
  typeDefs: graphql`
    type Mutation {
      sendTextMessage(textMessage: String!, accountId: ID!): Message
    }
  `,
  resolvers: {
    Mutation: {
      sendTextMessage,
    },
  },
});
