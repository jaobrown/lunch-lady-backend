import { integer, relationship, text } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

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
    balance: integer(),
  },
});
