import { jobsColl } from '../collections';
import { Job } from '../models/job';
import { ObjectId } from 'mongodb';

export class JobController {
  static async create(
    job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | '_id'>
  ): Promise<Job> {
    const jobs = await jobsColl();

    const doc = {
      ...job,
      id: new ObjectId().toString().substring(0, 12),
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      logs: [],
    };

    const result = await jobs.insertOne(doc);

    if (!result.insertedId) {
      throw new Error('Failed to create job');
    }

    return doc;
  }

  static async findById(id: string, userId: string): Promise<Job | null> {
    const jobs = await jobsColl();

    const job = await jobs.findOne({
      id,
      userId,
    });

    if (!job) {
      return null;
    }

    return job;
  }

  static async findByWorkflowId(
    workflowId: string,
    userId: string
  ): Promise<Job[]> {
    const jobs = await jobsColl();

    const jobDocs = await jobs
      .find({ workflowId, userId })
      .sort({ createdAt: -1 })
      .toArray();

    return jobDocs;
  }

  static async findByStatus(
    status: Job['status'],
    userId: string
  ): Promise<Job[]> {
    const jobs = await jobsColl();

    const jobDocs = await jobs
      .find({ status, userId })
      .sort({ createdAt: -1 })
      .toArray();

    return jobDocs;
  }

  static async update(
    id: string,
    userId: string,
    updates: Partial<Omit<Job, 'id' | 'userId' | 'createdAt' | '_id'>>
  ): Promise<Job | null> {
    const jobs = await jobsColl();

    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    };

    const job = await jobs.findOneAndUpdate(
      { id, userId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!job) {
      return null;
    }

    return job;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const jobs = await jobsColl();

    const result = await jobs.deleteOne({ id, userId });

    return result.deletedCount > 0;
  }

  static async getStatusCounts(
    userId: string
  ): Promise<Record<Job['status'], number>> {
    const jobs = await jobsColl();

    const pipeline = [
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];

    const results = await jobs.aggregate(pipeline).toArray();

    const counts = {
      queued: 0,
      active: 0,
      completed: 0,
      failed: 0,
      paused: 0,
    };

    results.forEach((result) => {
      if (result._id in counts) {
        counts[result._id as Job['status']] = result.count;
      }
    });

    return counts;
  }
}
