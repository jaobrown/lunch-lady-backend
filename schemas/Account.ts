import { relationship, text, virtual } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { TransactionCreateInput } from '../.keystone/schema-types';

export const Account = list({
  fields: {
    name: text({ isRequired: true }),
    phone: text({ isUnique: true }),
    messages: relationship({
      ref: 'Message.account',
      many: true,
    }),
    transactions: relationship({
      ref: 'Transaction.account',
      many: true,
    }),
    balance: virtual({
      graphQLReturnType: 'Int',
      resolver: async (item, _, context) => {
        const allTransactions = await context.lists.Transaction.findMany({
          where: { account: { id: item.id } },
          resolveFields: 'id,amount',
        });
        const totalBalance = allTransactions.reduce(function (
          tally: number,
          transaction: TransactionCreateInput
        ) {
          return tally + transaction.amount;
        },
        0);
        return totalBalance;
      },
    }),
  },
});
