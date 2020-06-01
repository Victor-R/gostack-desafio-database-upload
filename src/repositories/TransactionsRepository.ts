import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    return transactions.reduce(
      (result: Balance, currentValue) => {
        const newIncome =
          currentValue.type === 'income'
            ? result.income + currentValue.value
            : result.income;
        const newOutcome =
          currentValue.type === 'outcome'
            ? result.outcome + currentValue.value
            : result.outcome;

        return {
          income: newIncome,
          outcome: newOutcome,
          total: newIncome - newOutcome,
        } as Balance;
      },
      { income: 0, outcome: 0, total: 0 } as Balance,
    );
  }
}

export default TransactionsRepository;
