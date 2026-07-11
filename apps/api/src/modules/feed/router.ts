import { Router } from "express";
import { toFeedEvent } from "../../lib/mappers";
import { prisma } from "../../lib/prisma";

export const feedRouter = Router();

feedRouter.get("/", async (req, res) => {
	const page = Math.max(1, Number(req.query.page ?? 1));
	const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 25)));

	const [total, rows] = await Promise.all([
		prisma.feedEvent.count(),
		prisma.feedEvent.findMany({
			orderBy: { timestamp: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
			include: {
				beach: {
					select: { name: true }
				}
			}
		})
	]);

	res.json({
		page,
		pageSize,
		total,
		items: rows.map((row) => toFeedEvent(row, row.beach?.name))
	});
});
