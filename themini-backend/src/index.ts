import { CrosswordGen } from "./Classes/CrosswordGen.js";
import { DictionaryRepo } from "./Classes/DictionaryRepo.js";

const repo = new DictionaryRepo('./sql/themini.db', false);

for (let i = 0; i < 30; i++) {
    const grid = await CrosswordGen.generate(6, 6, 0.33, 7, false);
    for (let row of grid) {
        console.log(row.join(' '));
    }

    repo.createAndInsertCrossword(grid, `iterative test 6.${i}`);
}

// import express, { Request, Response, NextFunction } from 'express';
// import router from './routes/index';

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Use the API routes
// app.use('/api', router);

// // Example route
// app.get('/', (req: Request, res: Response) => {
// 	res.send('Hello from TheMini backend!');
// });

// // Error handler
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
// 	console.error(err.stack);
// 	res.status(500).send('Internal Server Error');
// });

// app.listen(PORT, () => {
// 	console.log(`Server is running on port ${PORT}`);
// });
