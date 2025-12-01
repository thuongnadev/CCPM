/**
 * PMS (Project Management System) API Client for Claude Code Plugin
 *
 * Flexible API client supporting multiple PM systems:
 * - LaraCollab (default)
 * - Jira
 * - Asana
 * - Trello
 * - Custom REST APIs
 */

const axios = require('axios');

class PMSAPI {
    constructor(baseUrl, apiToken, timeout = 30000, systemType = 'laracollab') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiToken = apiToken;
        this.timeout = timeout;
        this.systemType = systemType;
        this.lastError = null;

        // Initialize axios instance
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
            headers: this.getDefaultHeaders()
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Log requests in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`PMS API: ${config.method.toUpperCase()} ${config.url}`);
                }
                return config;
            },
            (error) => {
                this.lastError = error.message;
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                const message = error.response?.data?.message || error.message;
                this.lastError = message;
                throw new Error(`PMS API Error: ${message}`);
            }
        );
    }

    /**
     * Get default headers based on system type
     */
    getDefaultHeaders() {
        const baseHeaders = {
            'Accept': 'application/json',
            'User-Agent': 'PMS-Claude-Plugin/1.0.0'
        };

        switch (this.systemType) {
            case 'laracollab':
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${this.apiToken}`
                };
            case 'jira':
                return {
                    ...baseHeaders,
                    'Authorization': `Basic ${Buffer.from(`${this.apiToken}:`).toString('base64')}`,
                    'Content-Type': 'application/json'
                };
            case 'asana':
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${this.apiToken}`
                };
            case 'trello':
                return {
                    ...baseHeaders,
                    'Authorization': `OAuth oauth_consumer_key="${this.apiToken}"`
                };
            default:
                return {
                    ...baseHeaders,
                    'Authorization': `Bearer ${this.apiToken}`,
                    'X-API-Key': this.apiToken
                };
        }
    }

    /**
     * Get API endpoints based on system type
     */
    getEndpoints() {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    tasks: '/api/ai/tasks',
                    task: (id) => `/api/ai/tasks/${id}`,
                    createTask: '/api/ai/tasks',
                    startTask: (id) => `/api/ai/tasks/${id}/start`,
                    completeTask: (id) => `/api/ai/tasks/${id}/complete`,
                    updateProgress: (id) => `/api/ai/tasks/${id}/progress`,
                    addComment: (id) => `/api/ai/tasks/${id}/comment`,
                    projects: '/api/ai/projects',
                    project: (id) => `/api/ai/projects/${id}`,
                    systemInfo: '/api/ai/info',
                    user: '/api/user',
                    searchTasks: '/api/ai/tasks/search',
                    timeLogs: (id) => `/api/ai/tasks/${id}/time-logs`,
                    // CCPM specific endpoints
                    analyzeCriticalChain: (id) => `/api/ai/projects/${id}/critical-chain/analyze`,
                    enableCCPM: (id) => `/api/ai/projects/${id}/ccpm/enable`,
                    ccpmReport: (id) => `/api/ai/projects/${id}/ccpm/report`,
                    updateBufferStatus: (id) => `/api/ai/projects/${id}/ccpm/buffer-status`,
                    recalculateCriticalChain: (id) => `/api/ai/projects/${id}/critical-chain/recalculate`,
                    getResourceLoading: (id) => `/api/ai/projects/${id}/ccpm/resource-loading`,
                    identifyFeedingBuffers: (id) => `/api/ai/projects/${id}/ccpm/feeding-buffers`,
                    criticalChainTasks: (id) => `/api/ai/projects/${id}/critical-chain/tasks`,
                    updateTaskBuffer: (id) => `/api/ai/tasks/${id}/ccpm/buffer`,
                    ccpmDashboard: '/api/ai/ccpm/dashboard'
                };
            case 'jira':
                return {
                    tasks: '/rest/api/2/search?jql=project=PROJECTKEY',
                    task: (id) => `/rest/api/2/issue/${id}`,
                    createTask: '/rest/api/2/issue',
                    startTask: (id) => `/rest/api/2/issue/${id}/transitions`,
                    completeTask: (id) => `/rest/api/2/issue/${id}/transitions`,
                    updateProgress: (id) => `/rest/api/2/issue/${id}`,
                    addComment: (id) => `/rest/api/2/issue/${id}/comment`,
                    projects: '/rest/api/2/project',
                    project: (id) => `/rest/api/2/project/${id}`,
                    systemInfo: '/rest/api/2/serverInfo',
                    user: '/rest/api/2/myself',
                    searchTasks: '/rest/api/2/search',
                    timeLogs: (id) => `/rest/api/2/issue/${id}/worklog`
                };
            case 'asana':
                return {
                    tasks: '/api/1.0/tasks',
                    task: (id) => `/api/1.0/tasks/${id}`,
                    createTask: '/api/1.0/tasks',
                    startTask: (id) => `/api/1.0/tasks/${id}`,
                    completeTask: (id) => `/api/1.0/tasks/${id}`,
                    updateProgress: (id) => `/api/1.0/tasks/${id}`,
                    addComment: (id) => `/api/1.0/tasks/${id}/stories`,
                    projects: '/api/1.0/projects',
                    project: (id) => `/api/1.0/projects/${id}`,
                    systemInfo: '/api/1.0/users/me',
                    user: '/api/1.0/users/me',
                    searchTasks: '/api/1.0/tasks/search',
                    timeLogs: (id) => `/api/1.0/tasks/${id}/time_entries`
                };
            case 'trello':
                return {
                    tasks: '/1/boards/BOARD_ID/cards',
                    task: (id) => `/1/cards/${id}`,
                    createTask: '/1/cards',
                    startTask: (id) => `/1/cards/${id}`,
                    completeTask: (id) => `/1/cards/${id}`,
                    updateProgress: (id) => `/1/cards/${id}`,
                    addComment: (id) => `/1/cards/${id}/actions/comments`,
                    projects: '/1/members/me/boards',
                    project: (id) => `/1/boards/${id}`,
                    systemInfo: '/1/members/me',
                    user: '/1/members/me',
                    searchTasks: '/1/search',
                    timeLogs: (id) => `/1/cards/${id}/actions`
                };
            default:
                return {
                    tasks: '/api/tasks',
                    task: (id) => `/api/tasks/${id}`,
                    createTask: '/api/tasks',
                    startTask: (id) => `/api/tasks/${id}/start`,
                    completeTask: (id) => `/api/tasks/${id}/complete`,
                    updateProgress: (id) => `/api/tasks/${id}/progress`,
                    addComment: (id) => `/api/tasks/${id}/comments`,
                    projects: '/api/projects',
                    project: (id) => `/api/projects/${id}`,
                    systemInfo: '/api/info',
                    user: '/api/user',
                    searchTasks: '/api/tasks/search',
                    timeLogs: (id) => `/api/tasks/${id}/time-logs`
                };
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await this.getSystemInfo();
            return !!(response && (response.ai_version || response.version || response.id));
        } catch (error) {
            return false;
        }
    }

    /**
     * Get all tasks
     */
    async getTasks(filters = {}) {
        try {
            const endpoints = this.getEndpoints();
            const params = this.buildTaskParams(filters);
            const url = `${endpoints.tasks}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
            return await this.client.get(url);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get specific task details
     */
    async getTask(taskId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.task(taskId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new task
     */
    async createTask(taskData) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildTaskPayload(taskData);
            return await this.client.post(endpoints.createTask, payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Start working on a task
     */
    async startTask(taskId) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildStartTaskPayload();
            return await this.client.post(endpoints.startTask(taskId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update task progress
     */
    async updateTaskProgress(taskId, updateData) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildProgressPayload(updateData);
            return await this.client.put(endpoints.updateProgress(taskId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Complete a task
     */
    async completeTask(taskId, completionData) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildCompletionPayload(completionData);
            return await this.client.post(endpoints.completeTask(taskId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Add comment to task
     */
    async addTaskComment(taskId, content, isQuestion = false) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildCommentPayload(content, isQuestion);
            return await this.client.post(endpoints.addComment(taskId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get projects
     */
    async getProjects() {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.projects);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get specific project details
     */
    async getProject(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.project(projectId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get system information
     */
    async getSystemInfo() {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.systemInfo);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get user information
     */
    async getUser() {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.user);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search tasks
     */
    async searchTasks(query, filters = {}) {
        try {
            const endpoints = this.getEndpoints();
            const params = new URLSearchParams({ ...filters, q: query });
            return await this.client.get(`${endpoints.searchTasks}?${params.toString()}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get task time logs
     */
    async getTaskTimeLogs(taskId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.timeLogs(taskId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Analyze critical chain for a project
     */
    async analyzeCriticalChain(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.analyzeCriticalChain(projectId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Enable CCPM for a project
     */
    async enableCCPM(projectId, settings = {}) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildCCPMPayload(settings);
            return await this.client.post(endpoints.enableCCPM(projectId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get CCPM report for a project
     */
    async getCCPMReport(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.ccpmReport(projectId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update buffer status for a project
     */
    async updateBufferStatus(projectId, bufferData) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildBufferPayload(bufferData);
            return await this.client.put(endpoints.updateBufferStatus(projectId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Recalculate critical chain
     */
    async recalculateCriticalChain(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.post(endpoints.recalculateCriticalChain(projectId), {});
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get resource loading analysis
     */
    async getResourceLoading(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.getResourceLoading(projectId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Identify feeding buffers
     */
    async identifyFeedingBuffers(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.identifyFeedingBuffers(projectId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get critical chain tasks
     */
    async getCriticalChainTasks(projectId) {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.criticalChainTasks(projectId));
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update task buffer
     */
    async updateTaskBuffer(taskId, bufferData) {
        try {
            const endpoints = this.getEndpoints();
            const payload = this.buildTaskBufferPayload(bufferData);
            return await this.client.put(endpoints.updateTaskBuffer(taskId), payload);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get CCPM dashboard
     */
    async getCCPMDashboard() {
        try {
            const endpoints = this.getEndpoints();
            return await this.client.get(endpoints.ccpmDashboard);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Build task parameters based on system type
     */
    buildTaskParams(filters) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    status: filters.status,
                    priority: filters.priority,
                    project_id: filters.project_id
                };
            case 'jira':
                return {
                    jql: this.buildJQL(filters),
                    fields: 'summary,status,project,created,updated,priority,assignee'
                };
            case 'asana':
                return {
                    project: filters.project_id,
                    assignee: 'me',
                    completed: filters.status === 'completed' ? true : false
                };
            case 'trello':
                return {
                    filter: this.buildTrelloFilter(filters)
                };
            default:
                return filters;
        }
    }

    /**
     * Build task payload based on system type
     */
    buildTaskPayload(taskData) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    project_id: taskData.project_id,
                    name: taskData.name,
                    description: taskData.description,
                    estimation: taskData.estimation,
                    pricing_type: taskData.pricing_type || 'hourly',
                    billable: taskData.billable !== false,
                    priority: taskData.priority || 'medium'
                };
            case 'jira':
                return {
                    fields: {
                        project: { key: taskData.project_key },
                        summary: taskData.name,
                        description: taskData.description,
                        priority: { name: taskData.priority || 'Medium' },
                        issuetype: { name: taskData.issue_type || 'Task' }
                    }
                };
            case 'asana':
                return {
                    projects: [taskData.project_id],
                    name: taskData.name,
                    notes: taskData.description,
                    assignee: 'me'
                };
            case 'trello':
                return {
                    name: taskData.name,
                    desc: taskData.description,
                    idList: taskData.list_id,
                    due: taskData.due_date
                };
            default:
                return taskData;
        }
    }

    /**
     * Build start task payload
     */
    buildStartTaskPayload() {
        switch (this.systemType) {
            case 'jira':
                return {
                    transition: { id: '3' } // Start Progress transition ID
                };
            case 'asana':
                return {
                    assignee_status: 'upcoming'
                };
            default:
                return {};
        }
    }

    /**
     * Build progress update payload
     */
    buildProgressPayload(updateData) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    status: updateData.status,
                    progress_notes: updateData.progress_notes,
                    time_spent_minutes: updateData.time_spent_minutes
                };
            case 'jira':
                return {
                    update: {
                        summary: updateData.progress_notes,
                        timetracking: updateData.time_spent_minutes
                    }
                };
            case 'asana':
                return {
                    notes: updateData.progress_notes
                };
            default:
                return updateData;
        }
    }

    /**
     * Build completion payload
     */
    buildCompletionPayload(completionData) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    completion_notes: completionData.completion_notes,
                    deliverables: completionData.deliverables || [],
                    time_spent_minutes: completionData.time_spent_minutes
                };
            case 'jira':
                return {
                    transition: { id: '5' }, // Done transition ID
                    update: {
                        summary: completionData.completion_notes,
                        resolution: { name: 'Done' }
                    }
                };
            case 'asana':
                return {
                    completed: true,
                    notes: completionData.completion_notes
                };
            case 'trello':
                return {
                    closed: true,
                    desc: completionData.completion_notes
                };
            default:
                return completionData;
        }
    }

    /**
     * Build comment payload
     */
    buildCommentPayload(content, isQuestion) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    content,
                    is_question: isQuestion
                };
            case 'jira':
                return {
                    body: content
                };
            case 'asana':
                return {
                    text: content
                };
            case 'trello':
                return {
                    text: content
                };
            default:
                return { content, is_question: isQuestion };
        }
    }

    /**
     * Build CCPM payload for enabling CCPM
     */
    buildCCPMPayload(settings) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    project_buffer_percentage: settings.project_buffer_percentage || 50,
                    feeding_buffer_percentage: settings.feeding_buffer_percentage || 25,
                    resource_utilization_target: settings.resource_utilization_target || 75,
                    analyze_immediately: settings.analyze_immediately !== false,
                    critical_chain_start_date: settings.start_date,
                    estimated_duration_days: settings.duration_days
                };
            default:
                return settings;
        }
    }

    /**
     * Build buffer status update payload
     */
    buildBufferPayload(bufferData) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    project_buffer_consumed_percentage: bufferData.project_buffer_consumed_percentage,
                    feeding_buffers_status: bufferData.feeding_buffers_status || [],
                    critical_tasks_status: bufferData.critical_tasks_status || [],
                    buffer_analysis_notes: bufferData.buffer_analysis_notes
                };
            default:
                return bufferData;
        }
    }

    /**
     * Build task buffer update payload
     */
    buildTaskBufferPayload(bufferData) {
        switch (this.systemType) {
            case 'laracollab':
                return {
                    buffer_consumption_percentage: bufferData.buffer_consumption_percentage,
                    ccpm_status: bufferData.ccpm_status,
                    actual_duration_days: bufferData.actual_duration_days,
                    buffer_notes: bufferData.buffer_notes,
                    completion_variance_days: bufferData.completion_variance_days
                };
            default:
                return bufferData;
        }
    }

    /**
     * Build JQL for Jira search
     */
    buildJQL(filters) {
        let jql = 'project = PROJECTKEY';

        if (filters.status) {
            jql += ` AND status = "${filters.status}"`;
        }

        if (filters.priority) {
            jql += ` AND priority = "${filters.priority}"`;
        }

        if (filters.assignee) {
            jql += ` AND assignee = "${filters.assignee}"`;
        }

        return jql;
    }

    /**
     * Build Trello filter
     */
    buildTrelloFilter(filters) {
        let filterParts = [];

        if (filters.status === 'completed') {
            filterParts.push('closed:true');
        } else {
            filterParts.push('closed:false');
        }

        if (filters.project_id) {
            filterParts.push(`board:"${filters.project_id}"`);
        }

        return filterParts.join(' ');
    }

    /**
     * Handle API errors consistently
     */
    handleError(error) {
        const response = error.response || {};
        const status = response.status;
        const data = response.data || {};

        // Create consistent error response format
        const errorResponse = {
            success: false,
            message: data.message || error.message || 'Unknown API error',
            status: status,
            data: data.errors || null
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            };
        }

        return errorResponse;
    }

    /**
     * Get last error message
     */
    getLastError() {
        return this.lastError;
    }

    /**
     * Set timeout for requests
     */
    setTimeout(timeout) {
        this.timeout = timeout;
        this.client.defaults.timeout = timeout;
    }

    /**
     * Update API token
     */
    setApiToken(token) {
        this.apiToken = token;
        this.client.defaults.headers.common['Authorization'] = this.getDefaultHeaders().Authorization;
    }

    /**
     * Update base URL
     */
    setBaseUrl(url) {
        this.baseUrl = url.replace(/\/$/, '');
        this.client.defaults.baseURL = this.baseUrl;
    }

    /**
     * Set system type
     */
    setSystemType(systemType) {
        this.systemType = systemType;
        this.client.defaults.headers = this.getDefaultHeaders();
    }

    /**
     * Get current system type
     */
    getSystemType() {
        return this.systemType;
    }

    /**
     * Get supported system types
     */
    static getSupportedSystems() {
        return [
            {
                value: 'laracollab',
                name: 'LaraCollab',
                description: 'Laravel-based project management system',
                requiredAuth: 'Bearer Token'
            },
            {
                value: 'jira',
                name: 'Jira',
                description: 'Atlassian issue tracking and project management',
                requiredAuth: 'Basic Auth'
            },
            {
                value: 'asana',
                name: 'Asana',
                description: 'Work management platform',
                requiredAuth: 'Bearer Token'
            },
            {
                value: 'trello',
                name: 'Trello',
                description: 'Visual collaboration tool',
                requiredAuth: 'OAuth Consumer Key'
            },
            {
                value: 'custom',
                name: 'Custom API',
                description: 'Custom REST API endpoint',
                requiredAuth: 'Bearer Token'
            }
        ];
    }
}

module.exports = PMSAPI;