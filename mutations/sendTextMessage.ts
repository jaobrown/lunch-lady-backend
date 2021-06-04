/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { KeystoneContext } from '@keystone-next/types';
import { MessageCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require('twilio');

// A dummy gqp tag to get syntax highlighting
const graphql = String.raw;

export default async function sendTextMessage(
  root: unknown,
  { textMessage, accountId }: { textMessage: string; accountId: string },
  context: KeystoneContext
): Promise<MessageCreateInput> {
  // 1. Query current user , check for auth
  const sesh = context.session as Session;
  if (!sesh?.itemId) {
    throw new Error('You must be logged in to do this!');
  }

  // 2. Get account phone number by ID
  const account = await context.lists.Account.findOne({
    where: { id: accountId },
    resolveFields: graphql`
        id
        phone
        name
    `,
  });

  // 3. Run through twilio
  // 3.1 Instantiate twillio client
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // eslint-disable-next-line new-cap
  const twilioClient = new twilio(accountSid, authToken);

  // 3.2 setup object to store some twilio data on
  const twilioMessage = {
    body: '',
    dateCreated: '',
    sid: '',
  };
  // 3.3 send message
  await twilioClient.messages
    .create({
      body: textMessage,
      to: account.phone, // Text this number
      from: '5024431964', // From a valid Twilio number
    })
    .then((message) => {
      twilioMessage.body = message.body;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      twilioMessage.dateCreated = `${message.dateCreated}`;
      twilioMessage.sid = message.sid;
    });

  // 4. Create message in keystone
  // eslint-disable-next-line no-return-await
  return await context.lists.Message.createOne({
    data: {
      textMessage: twilioMessage.body,
      timestamp: twilioMessage.dateCreated,
      twilioSid: twilioMessage.sid,
      account: {
        connect: {
          id: accountId,
        },
      },
    },
  });
}
