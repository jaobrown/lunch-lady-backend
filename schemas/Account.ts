import { relationship, text, virtual } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { TransactionCreateInput } from '../.keystone/schema-types';

export const Account = list({
  fields: {
    name: text({ isRequired: true }),
    phone: text(),
    messages: relationship({
      ref: 'Message.account',
      many: true,
    }),
    transactions: relationship({
      ref: 'Transaction.account',
      many: true,
    }),
    notes: relationship({
      ref: 'Note.account',
      many: true,
    }),
    balance: virtual({
      graphQLReturnType: 'Int',
      resolver: async (item, _, context) => {
        const allTransactions = await context.lists.Transaction.findMany({
          where: { account: { id: item.id } },
          resolveFields: 'id,amount',
        });
        const totalBalance: number = allTransactions.reduce(function (
          tally: number,
          transaction: TransactionCreateInput
        ) {
          return tally + transaction.amount;
        },
        0);
        return totalBalance;
      },
    }),
    dateLastTextSent: virtual({
      resolver: async (item, _, context) => {
        const accountMessages = await context.lists.Message.findMany({
          where: { account: { id: item.id } },
          sortBy: ['timestamp_DESC'],
          resolveFields: 'id,timestamp',
        });
        const dateLastTexted: 'string' = accountMessages[0]?.timestamp
          ? accountMessages[0]?.timestamp
          : '—';
        return dateLastTexted;
      },
    }),
    needsTexted: virtual({
      graphQLReturnType: 'Boolean',
      resolver: async (item, _, context) => {
        const accountMessages = await context.lists.Message.findMany({
          where: { account: { id: item.id } },
          sortBy: ['timestamp_DESC'],
          resolveFields: 'id,timestamp',
        });
        let needsTexted = false;
        const lastTexted = new Date(accountMessages[0]?.timestamp).getDate();
        const fiveDaysAgo = new Date().getDate() - 5;
        if (lastTexted < fiveDaysAgo && item.phone !== null) {
          needsTexted = true;
        }
        return needsTexted;
      },
    }),
    timeline: virtual({
      extendGraphQLTypes: [
        'type TimelineEntry { timestamp: String, id: ID, amount: Int, textMessage: String }',
      ],
      graphQLReturnType: '[TimelineEntry]',
      resolver: async (item, _, context) => {
        const accountMessages = await context.lists.Message.findMany({
          where: { account: { id: item.id } },
          resolveFields: 'id,timestamp,textMessage,__typename',
        });
        const accountTransactions = await context.lists.Transaction.findMany({
          where: { account: { id: item.id } },
          resolveFields: 'id,timestamp,amount,__typename',
        });
        const timeline = accountMessages
          .concat(accountTransactions)
          .sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0
          );
        return timeline;
      },
    }),
  },
});
