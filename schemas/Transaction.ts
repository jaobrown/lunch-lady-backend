import { integer, relationship, timestamp } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Transaction = list({
  fields: {
    amount: integer({ isRequired: true }),
    timestamp: timestamp({ isRequired: true }),
    account: relationship({
      ref: 'Account.transactions',
    }),
  },
});
