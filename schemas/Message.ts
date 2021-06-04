import { relationship, text, timestamp } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';

export const Message = list({
  fields: {
    textMessage: text({ isRequired: true }),
    timestamp: timestamp({ isRequired: true }),
    twilioSid: text({ isRequired: true }),
    account: relationship({
      ref: 'Account.messages',
    }),
  },
});
