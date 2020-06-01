import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, category, type, value } = request.body;

  const createTransaction = new CreateTransactionService();

  const newTransaction = await createTransaction.execute({
    title,
    category,
    type,
    value,
  });

  return response.json(newTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.json({ message: 'Transaction Deleted' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const csvJson = request.file;

    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute({
      filepath: csvJson.path,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
