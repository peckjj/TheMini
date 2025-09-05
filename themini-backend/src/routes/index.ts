import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// Example route
router.get('/hello', (req: Request, res: Response) => {
	res.json({ message: 'Hello from the /api/hello route!' });
});

// Error handler for this router
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Internal server error' });
});

export default router;
