import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  statelessSessions,
  withItemData,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Role } from './schemas/Role';
import { Account } from './schemas/Account';
import { Message } from './schemas/Message';
import { Note } from './schemas/Note';
import { Transaction } from './schemas/Transaction';
import { permissionsList } from './schemas/fields';
import { extendGraphqlSchema } from './mutations';
import { sendPasswordResetEmail } from './lib/mail';
import { insertSeedData } from './seed-data';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/lunch-lady';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long they stay signed in?
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // todo: add in initial roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: true,
        credentials: true,
        methods: process.env.CORS_METHODS,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    lists: createSchema({
      // Schema items go in here
      User,
      Role,
      Message,
      Note,
      Account,
      Transaction,
    }),
    extendGraphqlSchema,
    ui: {
      // show ui for pass test
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
  })
);
