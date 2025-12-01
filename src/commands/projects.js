/**
 * Project-related commands for LaraCollab Plugin
 */

const { formatProjectList, formatError, formatSuccess } = require('../utils/formatters');

class ProjectCommands {
    constructor(api) {
        this.api = api;
    }

    /**
     * List all available projects
     */
    async listProjects() {
        try {
            const response = await this.api.getProjects();

            if (response.success) {
                const projects = response.data;
                return formatProjectList(projects);
            } else {
                return formatError(response.message || 'Failed to fetch projects');
            }
        } catch (error) {
            return formatError(`Error fetching projects: ${error.message}`);
        }
    }

    /**
     * Get details of a specific project
     */
    async getProject(projectId) {
        try {
            const response = await this.api.getProject(projectId);

            if (response.success) {
                const project = response.data;
                return formatProjectDetails(project);
            } else {
                return formatError(response.message || 'Failed to fetch project details');
            }
        } catch (error) {
            return formatError(`Error fetching project details: ${error.message}`);
        }
    }

    /**
     * Get project statistics
     */
    async getProjectStats(projectId) {
        try {
            const response = await this.api.getProjectStats(projectId);

            if (response.success) {
                const stats = response.data;
                return formatProjectStats(projectId, stats);
            } else {
                return formatError(response.message || 'Failed to fetch project statistics');
            }
        } catch (error) {
            return formatError(`Error fetching project statistics: ${error.message}`);
        }
    }

    /**
     * Search projects by name or description
     */
    async searchProjects(query) {
        try {
            const response = await this.api.searchProjects(query);

            if (response.success) {
                const projects = response.data;
                const resultsText = projects.length > 0
                    ? `Found ${projects.length} projects matching "${query}":\n\n${formatProjectList(projects)}`
                    : `No projects found matching "${query}"`;
                return resultsText;
            } else {
                return formatError(response.message || 'Failed to search projects');
            }
        } catch (error) {
            return formatError(`Error searching projects: ${error.message}`);
        }
    }
}

/**
 * Format project details
 */
function formatProjectDetails(project) {
    if (!project) {
        return formatError('Project not found');
    }

    let output = `**🏢 Project Details:**\n\n`;
    output += `**Name:** ${project.name}\n`;
    output += `**Status:** ${project.active !== false ? '🟢 Active' : '🔴 Inactive'}\n`;

    if (project.client_company) {
        output += `**Client:** ${project.client_company.name}\n`;
    }

    if (project.description) {
        output += `**Description:** ${project.description}\n`;
    }

    output += `**Created:** ${new Date(project.created_at).toLocaleString()}\n`;

    if (project.updated_at) {
        output += `**Last Updated:** ${new Date(project.updated_at).toLocaleString()}\n`;
    }

    return output;
}

/**
 * Format project statistics
 */
function formatProjectStats(projectId, stats) {
    let output = `**📊 Project #${projectId} Statistics:**\n\n`;

    if (stats.total_tasks !== undefined) {
        output += `**Total Tasks:** ${stats.total_tasks}\n`;
    }

    if (stats.completed_tasks !== undefined) {
        output += `**Completed Tasks:** ${stats.completed_tasks}\n`;
    }

    if (stats.pending_tasks !== undefined) {
        output += `**Pending Tasks:** ${stats.pending_tasks}\n`;
    }

    if (stats.in_progress_tasks !== undefined) {
        output += `**In Progress Tasks:** ${stats.in_progress_tasks}\n`;
    }

    if (stats.total_time_spent !== undefined) {
        const hours = Math.floor(stats.total_time_spent / 60);
        const minutes = stats.total_time_spent % 60;
        output += `**Total Time Spent:** ${hours}h ${minutes}m\n`;
    }

    if (stats.total_estimated_hours !== undefined) {
        output += `**Total Estimated Hours:** ${stats.total_estimated_hours}h\n`;
    }

    if (stats.budget !== undefined) {
        output += `**Budget:** $${stats.budget.toLocaleString()}\n`;
    }

    if (stats.billable_amount !== undefined) {
        output += `**Billable Amount:** $${stats.billable_amount.toLocaleString()}\n`;
    }

    return output;
}

module.exports = ProjectCommands;