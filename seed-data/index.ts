import { transactions } from './data';

export async function insertSeedData(ks: any) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks.keystone || ks;
  const adapter = keystone.adapters?.MongooseAdapter || keystone.adapter;

  console.log(`🌱 Inserting Seed Data: ${transactions.length} transactions`);
  const { mongoose } = adapter;
  for (const transaction of transactions) {
    console.log(`🙏 Adding transaction: ${transaction.family}`);
    const { _id } = await mongoose.model('Account').create({
      name: transaction.family,
    });
    await mongoose.model('Transaction').create({
      amount: transaction.balance,
      timestamp: transaction.timestamp,
      account: _id,
    });
  }
  console.log(`✅ Seed Data Inserted: ${transactions.length} transactions`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
