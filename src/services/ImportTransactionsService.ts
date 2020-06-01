import fs from 'fs';
import csvParse from 'csv-parse';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
// import AppError from '../errors/AppError';

interface Request {
  filepath: string;
}

class ImportTransactionsService {
  private async loadCSV(filepath: string): Promise<string[][]> {
    const readCSVStream = fs.createReadStream(filepath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: string[][] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

  async execute({ filepath }: Request): Promise<Transaction[]> {
    const transactionsArray = await this.loadCSV(filepath);

    const transactionsParsed = transactionsArray.map(transaction => {
      return {
        title: transaction[0],
        type: transaction[1] as 'income' | 'outcome',
        value: parseInt(transaction[2], 10),
        category: transaction[3],
      };
    });
    const createTransactionService = new CreateTransactionService();

    const result = await Promise.all(
      transactionsParsed.map(transaction =>
        createTransactionService.execute(transaction),
      ),
    );

    return result;
  }
}

export default ImportTransactionsService;
