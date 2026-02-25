import { workflowsColl } from '../collections';
import { Workflow, WorkflowNode, WorkflowEdge } from '../models/workflow';
import { ObjectId } from 'mongodb';

export class WorkflowController {
  static async create(
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | '_id'>
  ): Promise<Workflow> {
    const workflows = await workflowsColl();

    const doc = {
      ...workflow,
      id: new ObjectId().toString().substring(0, 12),
      createdAt: new Date(),
      updatedAt: new Date(),
      published: false,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
    };

    const result = await workflows.insertOne(doc);

    if (!result.insertedId) {
      throw new Error('Failed to create workflow');
    }

    return doc;
  }

  static async findById(id: string, userId: string): Promise<Workflow | null> {
    const workflows = await workflowsColl();

    const workflow = await workflows.findOne({
      id,
      userId,
    });

    if (!workflow) {
      return null;
    }

    return workflow;
  }

  static async findByUserId(userId: string, limit = 10): Promise<Workflow[]> {
    const workflows = await workflowsColl();

    const workflowDocs = await workflows
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    return workflowDocs;
  }

  static async update(
    id: string,
    userId: string,
    updates: Partial<Omit<Workflow, 'id' | 'userId' | 'createdAt' | '_id'>>
  ): Promise<Workflow | null> {
    const workflows = await workflowsColl();

    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    };

    const workflow = await workflows.findOneAndUpdate(
      { id, userId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!workflow) {
      return null;
    }

    return workflow;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const workflows = await workflowsColl();

    const result = await workflows.deleteOne({ id, userId });

    return result.deletedCount > 0;
  }

  static validateWorkflow(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for exactly one start node
    const startNodes = nodes.filter((node) => node.type === 'start');
    if (startNodes.length !== 1) {
      errors.push('Workflow must have exactly one start node');
    }

    // Check for at least one end node
    const endNodes = nodes.filter((node) => node.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least one end node');
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set([
      ...edges.map((edge) => edge.source),
      ...edges.map((edge) => edge.target),
    ]);

    nodes.forEach((node) => {
      if (node.type !== 'start' && !connectedNodeIds.has(node.id)) {
        errors.push(`Node "${node.data.label}" is not connected`);
      }
    });

    // Check for invalid connections
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) {
        errors.push(`Invalid edge: ${edge.source} -> ${edge.target}`);
        return;
      }

      // End nodes shouldn't have outgoing edges
      if (sourceNode.type === 'end') {
        errors.push(
          `End node "${sourceNode.data.label}" cannot have outgoing connections`
        );
      }

      // Start nodes shouldn't have incoming edges
      if (targetNode.type === 'start') {
        errors.push(
          `Start node "${targetNode.data.label}" cannot have incoming connections`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async publish(id: string, userId: string): Promise<Workflow | null> {
    const workflow = await this.findById(id, userId);

    if (!workflow) {
      return null;
    }

    // Copy draft to published version
    return this.update(id, userId, {
      published: true,
      publishedNodes: workflow.nodes,
      publishedEdges: workflow.edges,
    });
  }

  static async unpublish(id: string, userId: string): Promise<Workflow | null> {
    return this.update(id, userId, { published: false });
  }

  static async revertToPublished(
    id: string,
    userId: string
  ): Promise<Workflow | null> {
    const workflow = await this.findById(id, userId);

    if (!workflow || !workflow.publishedNodes || !workflow.publishedEdges) {
      return null;
    }

    // Restore published version to draft
    return this.update(id, userId, {
      nodes: workflow.publishedNodes,
      edges: workflow.publishedEdges,
    });
  }
}
