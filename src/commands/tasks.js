/**
 * Task-related commands for LaraCollab Plugin
 */

const { formatTaskList, formatTaskDetails, formatError, formatSuccess } = require('../utils/formatters');

class TaskCommands {
    constructor(api) {
        this.api = api;
    }

    /**
     * List all tasks with optional filters
     */
    async listTasks(filters = {}) {
        try {
            const response = await this.api.getTasks(filters);

            if (response.success) {
                const tasks = response.data.data || response.data;
                return formatTaskList(tasks, {
                    showProject: true,
                    showStatus: true,
                    showProgress: true,
                    showCreated: false
                });
            } else {
                return formatError(response.message || 'Failed to fetch tasks');
            }
        } catch (error) {
            return formatError(`Error fetching tasks: ${error.message}`);
        }
    }

    /**
     * Get details of a specific task
     */
    async getTask(taskId) {
        try {
            const response = await this.api.getTask(taskId);

            if (response.success) {
                const task = response.data;
                return formatTaskDetails(task);
            } else {
                return formatError(response.message || 'Failed to fetch task details');
            }
        } catch (error) {
            return formatError(`Error fetching task details: ${error.message}`);
        }
    }

    /**
     * Create a new task
     */
    async createTask(taskData) {
        try {
            // Set default values
            const defaultData = {
                pricing_type: 'hourly',
                billable: true,
                status: 'pending'
            };

            const finalTaskData = { ...defaultData, ...taskData };

            const response = await this.api.createTask(finalTaskData);

            if (response.success) {
                const task = response.data;
                return formatSuccess(`Task #${task.number} created successfully!`, {
                    'Task ID': task.id,
                    'Task Number': task.number,
                    'Name': task.name,
                    'Project': task.project?.name || 'Unassigned',
                    'Status': task.status || 'Pending',
                    'Created': new Date(task.created_at).toLocaleString()
                });
            } else {
                return formatError(response.message || 'Failed to create task');
            }
        } catch (error) {
            return formatError(`Error creating task: ${error.message}`);
        }
    }

    /**
     * Start working on a task
     */
    async startTask(taskId) {
        try {
            const response = await this.api.startTask(taskId);

            if (response.success) {
                const timeLog = response.data;
                return formatSuccess(`Task #${taskId} started successfully!`, {
                    'Time Log ID': timeLog.id,
                    'Task ID': taskId,
                    'Started at': new Date(timeLog.started_at).toLocaleString(),
                    'Notes': 'Time tracking started automatically'
                });
            } else {
                return formatError(response.message || 'Failed to start task');
            }
        } catch (error) {
            return formatError(`Error starting task: ${error.message}`);
        }
    }

    /**
     * Complete a task
     */
    async completeTask(taskId, completionData) {
        try {
            const defaultCompletionData = {
                completion_notes: 'Task completed via Claude Code plugin',
                deliverables: []
            };

            const finalCompletionData = { ...defaultCompletionData, ...completionData };

            const response = await this.api.completeTask(taskId, finalCompletionData);

            if (response.success) {
                const task = response.data;
                return formatSuccess(`Task #${task.number} completed successfully!`, {
                    'Task ID': task.id,
                    'Task Number': task.number,
                    'Name': task.name,
                    'Completed at': new Date(task.completed_at).toLocaleString(),
                    'Time spent': `${task.time_spent || 'Unknown'} minutes`,
                    'Notes': finalCompletionData.completion_notes
                });
            } else {
                return formatError(response.message || 'Failed to complete task');
            }
        } catch (error) {
            return formatError(`Error completing task: ${error.message}`);
        }
    }

    /**
     * Update task progress
     */
    async updateProgress(taskId, progressData) {
        try {
            const response = await this.api.updateTaskProgress(taskId, progressData);

            if (response.success) {
                return formatSuccess(`Task #${taskId} progress updated successfully!`, {
                    'Task ID': taskId,
                    'Status': progressData.status || 'Updated',
                    'Time spent': `${progressData.time_spent_minutes || 0} minutes`,
                    'Notes': progressData.progress_notes || 'Progress updated'
                });
            } else {
                return formatError(response.message || 'Failed to update task progress');
            }
        } catch (error) {
            return formatError(`Error updating task progress: ${error.message}`);
        }
    }

    /**
     * Add comment to task
     */
    async addComment(taskId, content, isQuestion = false) {
        try {
            const response = await this.api.addTaskComment(taskId, content, isQuestion);

            if (response.success) {
                const comment = response.data;
                return formatSuccess(`Comment added to task #${taskId}!`, {
                    'Comment ID': comment.id,
                    'Content': content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    'Type': isQuestion ? 'Question' : 'Comment',
                    'Added at': new Date(comment.created_at).toLocaleString()
                });
            } else {
                return formatError(response.message || 'Failed to add comment');
            }
        } catch (error) {
            return formatError(`Error adding comment: ${error.message}`);
        }
    }

    /**
     * Search tasks
     */
    async searchTasks(query, filters = {}) {
        try {
            const response = await this.api.searchTasks(query, filters);

            if (response.success) {
                const tasks = response.data.data || response.data;
                const resultsText = tasks.length > 0
                    ? `Found ${tasks.length} tasks matching "${query}":\n\n${formatTaskList(tasks)}`
                    : `No tasks found matching "${query}"`;
                return resultsText;
            } else {
                return formatError(response.message || 'Failed to search tasks');
            }
        } catch (error) {
            return formatError(`Error searching tasks: ${error.message}`);
        }
    }

    /**
     * Get task time logs
     */
    async getTimeLogs(taskId) {
        try {
            const response = await this.api.getTaskTimeLogs(taskId);

            if (response.success) {
                const timeLogs = response.data;

                if (timeLogs.length === 0) {
                    return `No time logs found for task #${taskId}`;
                }

                let output = `**⏱️ Time Logs for Task #${taskId}:**\n\n`;

                timeLogs.forEach((log, index) => {
                    const duration = this.formatDuration(log.minutes);
                    const date = new Date(log.started_at).toLocaleDateString();
                    output += `${index + 1}. ${duration} - ${date}\n`;
                    if (log.notes) {
                        output += `   📝 ${log.notes.substring(0, 80)}${log.notes.length > 80 ? '...' : ''}\n`;
                    }
                    output += '\n';
                });

                return output;
            } else {
                return formatError(response.message || 'Failed to fetch time logs');
            }
        } catch (error) {
            return formatError(`Error fetching time logs: ${error.message}`);
        }
    }

    /**
     * Helper to format duration
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    }

    /**
     * Parse command arguments for task creation
     */
    parseTaskArgs(args) {
        const taskData = {};
        const textParts = [];

        args.forEach(arg => {
            if (arg.startsWith('project:')) {
                taskData.project_id = parseInt(arg.replace('project:', ''));
            } else if (arg.startsWith('estimate:')) {
                taskData.estimation = parseFloat(arg.replace('estimate:', ''));
            } else if (arg.startsWith('type:')) {
                taskData.pricing_type = arg.replace('type:', '');
            } else if (arg.startsWith('name:')) {
                taskData.name = arg.replace('name:', '');
            } else if (arg.startsWith('desc:')) {
                taskData.description = arg.replace('desc:', '');
            } else {
                textParts.push(arg);
            }
        });

        // If no explicit name provided, use joined text parts
        if (!taskData.name) {
            taskData.name = textParts.join(' ');
        }

        // If no description provided, generate default
        if (!taskData.description) {
            taskData.description = `Created via Claude Code plugin at ${new Date().toISOString()}`;
        }

        return taskData;
    }

    /**
     * Parse completion arguments
     */
    parseCompletionArgs(args) {
        const taskId = this.extractTaskId(args);
        const notes = args.filter(arg => !arg.match(/^\d+$/)).join(' ');

        return { taskId, notes };
    }

    /**
     * Extract task ID from arguments
     */
    extractTaskId(args) {
        for (const arg of args) {
            const match = arg.match(/^(\d+)$/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return null;
    }
}

module.exports = TaskCommands;