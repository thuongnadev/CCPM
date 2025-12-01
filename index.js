/**
 * PMS Plugin for Claude Code
 *
 * A comprehensive plugin for integrating multiple Project Management Systems
 * directly into Claude Code workspace. Supports LaraCollab, Jira, Asana, Trello, and more.
 *
 * @author PMS Plugin Team
 * @version 1.0.0
 */

const PMSAPI = require('./src/api-client');
const ConfigManager = require('./src/config');
const TaskCommands = require('./src/commands/tasks');
const ProjectCommands = require('./src/commands/projects');
const CriticalChainCommands = require('./src/commands/ccpm/criticalchain');
const { formatTaskList, formatProjectList, formatError, formatSystemInfo } = require('./src/utils/formatters');

class PMSPlugin {
    constructor() {
        this.name = 'pms-plugin';
        this.version = '1.0.0';
        this.configManager = new ConfigManager();
        this.api = null;
        this.taskCommands = null;
        this.projectCommands = null;
        this.criticalChainCommands = null;

        // Initialize configuration
        this.initConfig();
    }

    /**
     * Initialize plugin configuration
     */
    async initConfig() {
        try {
            await this.configManager.loadConfig();
            if (this.configManager.isConfigured()) {
                this.api = new PMSAPI(
                    this.configManager.get('baseUrl'),
                    this.configManager.get('apiToken'),
                    this.configManager.get('timeout', 30)
                );

                // Initialize command handlers
                this.taskCommands = new TaskCommands(this.api);
                this.projectCommands = new ProjectCommands(this.api);
                this.criticalChainCommands = new CriticalChainCommands(this.api);
            }
        } catch (error) {
            console.warn('PMS: Failed to load configuration:', error.message);
        }
    }

    /**
     * Register slash commands
     */
    getSlashCommands() {
        return {
            'pms-tasks': {
                description: 'List all tasks from your Project Management System',
                usage: '/pms-tasks [filters]',
                handler: this.handleTasksCommand.bind(this)
            },
            'pms-projects': {
                description: 'List all projects from your Project Management System',
                usage: '/pms-projects',
                handler: this.handleProjectsCommand.bind(this)
            },
            'pms-create-task': {
                description: 'Create a new task in your Project Management System',
                usage: '/pms-create-task [task details]',
                handler: this.handleCreateTaskCommand.bind(this)
            },
            'pms-start-task': {
                description: 'Start working on a task',
                usage: '/pms-start-task <task-id>',
                handler: this.handleStartTaskCommand.bind(this)
            },
            'pms-complete-task': {
                description: 'Mark a task as completed',
                usage: '/pms-complete-task <task-id> [notes]',
                handler: this.handleCompleteTaskCommand.bind(this)
            },
            'pms-status': {
                description: 'Show Project Management System connection status',
                usage: '/pms-status',
                handler: this.handleStatusCommand.bind(this)
            },
            'pms-config': {
                description: 'Configure Project Management System API settings',
                usage: '/pms-config',
                handler: this.handleConfigCommand.bind(this)
            },
            // CCPM specific commands
            'ccpm-enable': {
                description: 'Enable Critical Chain Project Management for a project',
                usage: '/ccpm-enable <project-id> [options]',
                handler: this.handleCCPMEnableCommand.bind(this)
            },
            'ccpm-analyze': {
                description: 'Analyze critical chain for a project',
                usage: '/ccpm-analyze <project-id>',
                handler: this.handleCCPMAnalyzeCommand.bind(this)
            },
            'ccpm-report': {
                description: 'Generate CCPM status report for a project',
                usage: '/ccpm-report <project-id>',
                handler: this.handleCCPMReportCommand.bind(this)
            },
            'ccpm-resources': {
                description: 'Get resource loading analysis for a project',
                usage: '/ccpm-resources <project-id>',
                handler: this.handleCCPMResourcesCommand.bind(this)
            },
            'ccpm-buffers': {
                description: 'Identify feeding buffers for a project',
                usage: '/ccpm-buffers <project-id>',
                handler: this.handleCCPMBuffersCommand.bind(this)
            },
            'ccpm-recalculate': {
                description: 'Recalculate critical chain after changes',
                usage: '/ccpm-recalculate <project-id>',
                handler: this.handleCCPMRecalculateCommand.bind(this)
            },
            'ccpm-dashboard': {
                description: 'Get overall CCPM dashboard',
                usage: '/ccpm-dashboard',
                handler: this.handleCCPMDashboardCommand.bind(this)
            },
            'ccpm-update-buffer': {
                description: 'Update buffer status for a task',
                usage: '/ccpm-update-buffer <task-id> <percentage>',
                handler: this.handleCCPMUpdateBufferCommand.bind(this)
            }
        };
    }

    /**
     * Handle /pms-tasks command
     */
    async handleTasksCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const filters = this.parseTaskFilters(args);
            return await this.taskCommands.listTasks(filters);
        } catch (error) {
            return formatError(`Error fetching tasks: ${error.message}`);
        }
    }

    /**
     * Handle /pms-projects command
     */
    async handleProjectsCommand() {
        if (!this.ensureConfigured()) return;

        try {
            return await this.projectCommands.listProjects();
        } catch (error) {
            return formatError(`Error fetching projects: ${error.message}`);
        }
    }

    /**
     * Handle /pms-create-task command
     */
    async handleCreateTaskCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const taskData = this.taskCommands.parseTaskArgs(args);
            return await this.taskCommands.createTask(taskData);
        } catch (error) {
            return formatError(`Error creating task: ${error.message}`);
        }
    }

    /**
     * Handle /pms-start-task command
     */
    async handleStartTaskCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const taskId = this.taskCommands.extractTaskId(args);
            if (!taskId) {
                return formatError('Please provide a valid task ID: /pms-start-task <task-id>');
            }
            return await this.taskCommands.startTask(taskId);
        } catch (error) {
            return formatError(`Error starting task: ${error.message}`);
        }
    }

    /**
     * Handle /pms-complete-task command
     */
    async handleCompleteTaskCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const { taskId, notes } = this.taskCommands.parseCompletionArgs(args);
            if (!taskId) {
                return formatError('Please provide a valid task ID: /pms-complete-task <task-id> [notes]');
            }

            const completionData = {
                completion_notes: notes || 'Task completed via PMS plugin',
                deliverables: []
            };

            return await this.taskCommands.completeTask(taskId, completionData);
        } catch (error) {
            return formatError(`Error completing task: ${error.message}`);
        }
    }

    /**
     * Handle /pms-status command
     */
    async handleStatusCommand() {
        if (!this.api) {
            const message = '**PMS Plugin Status:** ⚠️ Not Configured\n\n';
            message += 'Please run `/pms-config` to set up your Project Management System API connection.\n\n';
            message += '**Example setup:**\n';
            message += '```\n';
            message += '/pms-config\n';
            message += '```\n\n';
            message += 'Then provide:\n';
            message += '- Base URL: https://your-pms-domain.com\n';
            message += '- API Token: Your API token from PMS settings';
            return message;
        }

        try {
            const info = await this.api.getSystemInfo();
            return formatSystemInfo(info);
        } catch (error) {
            const message = `Connection error: ${error.message}\n\n`;
            message += '**Troubleshooting:**\n';
            message += '1. Check your internet connection\n';
            message += '2. Verify your PMS instance is accessible\n';
            message += '3. Run `/pms-config` to update your settings\n';
            message += '4. Check if your API token is valid';
            return formatError(message);
        }
    }

    /**
     * Handle /ccpm-enable command
     */
    async handleCCPMEnableCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const projectId = this.extractProjectId(args);
            if (!projectId) {
                return formatError('Please provide a project ID: /ccpm-enable <project-id> [options]');
            }

            const settings = this.parseCCPMSettings(args);
            return await this.criticalChainCommands.enableCCPM(projectId, settings);
        } catch (error) {
            return formatError(`Error enabling CCPM: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-analyze command
     */
    async handleCCPMAnalyzeCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const projectId = this.extractProjectId(args);
            if (!projectId) {
                return formatError('Please provide a project ID: /ccpm-analyze <project-id>');
            }

            return await this.criticalChainCommands.analyzeCriticalChain(projectId);
        } catch (error) {
            return formatError(`Error analyzing critical chain: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-report command
     */
    async handleCCPMReportCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const projectId = this.extractProjectId(args);
            if (!projectId) {
                return formatError('Please provide a project ID: /ccpm-report <project-id>');
            }

            return await this.criticalChainCommands.generateCCPMReport(projectId);
        } catch (error) {
            return formatError(`Error generating CCPM report: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-resources command
     */
    async handleCCPMResourcesCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const projectId = this.extractProjectId(args);
            if (!projectId) {
                return formatError('Please provide a project ID: /ccpm-resources <project-id>');
            }

            return await this.criticalChainCommands.getResourceLoading(projectId);
        } catch (error) {
            return formatError(`Error getting resource loading: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-buffers command
     */
    async handleCCPMBuffersCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const projectId = this.extractProjectId(args);
            if (!projectId) {
                return formatError('Please provide a project ID: /ccpm-buffers <project-id>');
            }

            return await this.criticalChainCommands.identifyFeedingBuffers(projectId);
        } catch (error) {
            return formatError(`Error identifying feeding buffers: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-recalculate command
     */
    async handleCCPMRecalculateCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const projectId = this.extractProjectId(args);
            if (!projectId) {
                return formatError('Please provide a project ID: /ccpm-recalculate <project-id>');
            }

            return await this.criticalChainCommands.recalculateCriticalChain(projectId);
        } catch (error) {
            return formatError(`Error recalculating critical chain: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-dashboard command
     */
    async handleCCPMDashboardCommand() {
        if (!this.ensureConfigured()) return;

        try {
            return await this.criticalChainCommands.getCCPMDashboard();
        } catch (error) {
            return formatError(`Error getting CCPM dashboard: ${error.message}`);
        }
    }

    /**
     * Handle /ccpm-update-buffer command
     */
    async handleCCPMUpdateBufferCommand(args) {
        if (!this.ensureConfigured()) return;

        try {
            const { taskId, percentage } = this.parseBufferUpdateArgs(args);
            if (!taskId || !percentage) {
                return formatError('Please provide task ID and buffer percentage: /ccpm-update-buffer <task-id> <percentage>');
            }

            const bufferData = {
                buffer_consumption_percentage: parseFloat(percentage),
                ccpm_status: percentage > 75 ? 'buffer_consumed' : percentage > 50 ? 'in_progress' : 'not_started',
                buffer_notes: `Buffer updated via PMS plugin`
            };

            return await this.criticalChainCommands.updateTaskBuffer(taskId, bufferData);
        } catch (error) {
            return formatError(`Error updating task buffer: ${error.message}`);
        }
    }

    /**
     * Handle /pms-config command
     */
    async handleConfigCommand() {
        const inquirer = require('inquirer');

        try {
            console.log('**🔧 Project Management System Configuration**\n');

            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'systemType',
                    message: 'Select your Project Management System:',
                    choices: [
                        { name: 'LaraCollab', value: 'laracollab' },
                        { name: 'Jira', value: 'jira' },
                        { name: 'Asana', value: 'asana' },
                        { name: 'Trello', value: 'trello' },
                        { name: 'Custom API', value: 'custom' }
                    ],
                    default: 'laracollab'
                },
                {
                    type: 'input',
                    name: 'baseUrl',
                    message: 'Enter your PMS base URL:',
                    default: this.configManager.get('baseUrl') || 'https://your-pms-domain.com',
                    validate: (input) => {
                        if (!input) return 'Base URL is required';
                        try {
                            new URL(input);
                            return true;
                        } catch {
                            return 'Please enter a valid URL (e.g., https://your-domain.com)';
                        }
                    }
                },
                {
                    type: 'password',
                    name: 'apiToken',
                    message: 'Enter your PMS API token:',
                    default: this.configManager.get('apiToken') || '',
                    validate: (input) => {
                        if (!input) return 'API token is required';
                        if (input.length < 10) return 'Token appears to be invalid (too short)';
                        return true;
                    }
                },
                {
                    type: 'number',
                    name: 'timeout',
                    message: 'Request timeout (seconds):',
                    default: this.configManager.get('timeout') || 30,
                    validate: (input) => {
                        if (input < 5 || input > 300) return 'Timeout must be between 5 and 300 seconds';
                        return true;
                    }
                },
                {
                    type: 'confirm',
                    name: 'autoStartTasks',
                    message: 'Auto-start tasks when created?',
                    default: this.configManager.get('autoStartTasks', false)
                },
                {
                    type: 'confirm',
                    name: 'notifications',
                    message: 'Enable task notifications?',
                    default: this.configManager.get('notifications', true)
                }
            ]);

            // Add system type to answers
            answers.systemType = answers.systemType;

            // Save configuration
            await this.configManager.saveConfig(answers);

            // Reinitialize API with new config
            this.api = new PMSAPI(answers.baseUrl, answers.apiToken, answers.timeout);
            this.taskCommands = new TaskCommands(this.api);
            this.projectCommands = new ProjectCommands(this.api);

            // Test connection
            if (await this.api.testConnection()) {
                let message = '✅ **PMS configured successfully!**\n\n';
                message += `**System:** ${answers.systemType.charAt(0).toUpperCase() + answers.systemType.slice(1)}\n`;
                message += `**Base URL:** ${answers.baseUrl}\n`;
                message += `**Timeout:** ${answers.timeout}s\n`;
                message += `**Auto-start tasks:** ${answers.autoStartTasks ? 'Yes' : 'No'}\n`;
                message += `**Notifications:** ${answers.notifications ? 'Enabled' : 'Disabled'}\n\n`;
                message += '**Next steps:**\n';
                message += '- Try `/pms-tasks` to see your tasks\n';
                message += '- Try `/pms-projects` to see available projects\n';
                message += '- Try `/pms-create-task` to create a new task\n\n';
                message += '**Example commands:**\n';
                message += '```\n';
                message += '/pms-tasks\n';
                message += '/pms-create-task "Fix login issue" project:1 estimate:2\n';
                message += '/pms-start-task 123\n';
                message += '```';
                return message;
            } else {
                let message = 'Configuration saved but connection test failed.\n\n';
                message += '**Please check:**\n';
                message += '1. Your PMS URL is correct\n';
                message += '2. Your API token is valid\n';
                message += '3. Your PMS instance is accessible\n';
                message += '4. Your token has correct permissions\n\n';
                message += 'You can re-run `/pms-config` to fix any issues.';
                return formatError(message);
            }
        } catch (error) {
            return formatError(`Configuration error: ${error.message}`);
        }
    }

    /**
     * Pre-command hook
     */
    async preCommandHook(command) {
        // Optional: Auto-sync tasks or track time
        return null;
    }

    /**
     * Post-command hook
     */
    async postCommandHook(command, result) {
        // Optional: Log activities or update status
        return null;
    }

    /**
     * Helper methods
     */
    ensureConfigured() {
        if (!this.api || !this.configManager.isConfigured()) {
            throw new Error('PMS not configured. Please run `/pms-config` first.');
        }
        return true;
    }

    parseTaskFilters(args) {
        const filters = {};

        args.forEach(arg => {
            switch (arg.toLowerCase()) {
                case 'completed':
                    filters.status = 'completed';
                    break;
                case 'pending':
                    filters.status = 'pending';
                    break;
                case 'in_progress':
                    filters.status = 'in_progress';
                    break;
                case 'urgent':
                    filters.priority = 'urgent';
                    break;
                case 'high':
                    filters.priority = 'high';
                    break;
                case 'medium':
                    filters.priority = 'medium';
                    break;
                case 'low':
                    filters.priority = 'low';
                    break;
                default:
                    // Check for project filter
                    if (arg.startsWith('project:')) {
                        const projectId = parseInt(arg.replace('project:', ''));
                        if (projectId) filters.project_id = projectId;
                    }
                    break;
            }
        });

        return filters;
    }

    /**
     * Extract project ID from arguments
     */
    extractProjectId(args) {
        for (const arg of args) {
            const match = arg.match(/^(\d+)$/);
            if (match) {
                return parseInt(match[1]);
            }
            if (arg.startsWith('project:')) {
                return parseInt(arg.replace('project:', ''));
            }
        }
        return null;
    }

    /**
     * Parse CCPM settings from arguments
     */
    parseCCPMSettings(args) {
        const settings = {};

        args.forEach(arg => {
            if (arg.startsWith('project-buffer:')) {
                settings.project_buffer_percentage = parseFloat(arg.replace('project-buffer:', ''));
            } else if (arg.startsWith('feeding-buffer:')) {
                settings.feeding_buffer_percentage = parseFloat(arg.replace('feeding-buffer:', ''));
            } else if (arg.startsWith('resource-utilization:')) {
                settings.resource_utilization_target = parseFloat(arg.replace('resource-utilization:', ''));
            } else if (arg.startsWith('start-date:')) {
                settings.start_date = arg.replace('start-date:', '');
            } else if (arg.startsWith('duration:')) {
                settings.duration_days = parseInt(arg.replace('duration:', ''));
            } else if (arg.startsWith('auto-analyze:')) {
                settings.analyze_immediately = arg.replace('auto-analyze:', '') === 'true';
            }
        });

        return settings;
    }

    /**
     * Parse buffer update arguments
     */
    parseBufferUpdateArgs(args) {
        let taskId = null;
        let percentage = null;

        args.forEach(arg => {
            if (arg.match(/^(\d+)$/)) {
                taskId = parseInt(arg);
            } else if (arg.includes('%') || !isNaN(parseFloat(arg))) {
                percentage = parseFloat(arg.replace('%', ''));
            }
        });

        return { taskId, percentage };
    }

    /**
     * Plugin metadata
     */
    getMetadata() {
        return {
            name: 'pms-plugin',
            displayName: 'Project Management System Integration with CCPM',
            description: 'Seamlessly integrate multiple Project Management Systems with Critical Chain Project Management capabilities in Claude Code',
            version: '1.0.0',
            author: 'PMS Plugin Team',
            license: 'MIT',
            homepage: 'https://pms-plugin.com',
            repository: 'https://github.com/yourcompany/pms-plugin',
            category: 'Development Tools',
            tags: [
                'project-management',
                'task-management',
                'time-tracking',
                'critical-chain',
                'ccpm',
                'buffer-management',
                'resource-planning',
                'collaboration',
                'productivity',
                'api',
                'jira',
                'asana',
                'trello',
                'laracollab'
            ]
        };
    }
}

// Export plugin for Claude Code
module.exports = PMSPlugin;