import { integer, relationship, timestamp } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Transaction = list({
  fields: {
    amount: integer({ isRequired: true }),
    timestamp: timestamp({
      isRequired: true,
      defaultValue: async ({ context, originalInput }) => {
        const ISONow = new Date().toISOString();
        return ISONow;
      },
    }),
    account: relationship({
      ref: 'Account.transactions',
    }),
  },
});
