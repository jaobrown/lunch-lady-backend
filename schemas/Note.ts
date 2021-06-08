import { relationship, text, timestamp } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Note = list({
  fields: {
    content: text({ isRequired: true }),
    timestamp: timestamp({
      isRequired: true,
      defaultValue: async ({ context, originalInput }) => {
        const ISONow = new Date().toISOString();
        return ISONow;
      },
    }),
    account: relationship({
      ref: 'Account.notes',
    }),
  },
});
