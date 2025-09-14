/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "mongoose";

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, string>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    filter(): this {
        const filter: any = { ...this.query };
        const excludeField = ["searchTerm", "sort", "fields", "page", "limit", "requestedAt", "minFare", "maxFare"];

        excludeField.forEach(field => delete filter[field]);

        // Handle requestedAt as a full-day range
        if (this.query.requestedAt) {
            const date = new Date(this.query.requestedAt);
            const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
            filter.requestedAt = { $gte: startOfDay, $lte: endOfDay };
        }

        // ✅ Handle fare range
        const minFare = this.query.minFare ? Number(this.query.minFare) : undefined;
        const maxFare = this.query.maxFare ? Number(this.query.maxFare) : undefined;

        if (minFare !== undefined || maxFare !== undefined) {
            const fareFilter: any = {};
            if (minFare !== undefined) fareFilter.$gte = minFare;
            if (maxFare !== undefined) fareFilter.$lte = maxFare;
            this.modelQuery = this.modelQuery.find({ fare: fareFilter });
        }

        this.modelQuery = this.modelQuery.find(filter);
        return this;
    }

    search(searchableFields: string[]): this {
        const searchTerm = this.query.searchTerm || "";
        if (!searchTerm) return this;

        const searchQuery = {
            $or: searchableFields.map(field => ({
                [field]: { $regex: searchTerm, $options: "i" }
            }))
        };

        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }

    sort(): this {
        const sort = this.query.sort || "-requestedAt";
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }

    fields(): this {
        const fields = this.query.fields?.split(",").join(" ") || "";
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

    paginate(): this {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    build() {
        return this.modelQuery;
    }

    async getMeta() {
        const totalDocuments = await this.modelQuery.model.countDocuments(this.modelQuery.getQuery());
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const totalPage = Math.ceil(totalDocuments / limit);

        return { page, limit, total: totalDocuments, totalPage };
    }
}