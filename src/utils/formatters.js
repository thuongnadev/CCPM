/**
 * Formatting utilities for LaraCollab Plugin
 */

/**
 * Format task list for display
 */
function formatTaskList(tasks, options = {}) {
    if (!tasks || tasks.length === 0) {
        return '**📋 No tasks found**\n\nTry `/lara-create-task` to create your first task!';
    }

    const {
        showProject = true,
        showStatus = true,
        showProgress = true,
        showCreated = false,
        maxTasks = 20
    } = options;

    const displayTasks = tasks.slice(0, maxTasks);

    let output = `**📋 Found ${tasks.length} task${tasks.length > 1 ? 's' : ''}:**\n\n`;

    displayTasks.forEach((task, index) => {
        const number = task.number || task.id;
        const status = getTaskStatus(task);
        const statusEmoji = getStatusEmoji(task);
        const progressBar = getProgressBar(task.progress || 0);
        const projectInfo = showProject && task.project ? ` • ${task.project.name}` : '';
        const createdInfo = showCreated ? ` • ${formatDate(task.created_at)}` : '';

        output += `**${index + 1}. #${number}:** ${task.name}\n`;
        output += `   ${statusEmoji} ${status}${progressBar}${projectInfo}${createdInfo}\n`;

        if (task.description && task.description.length > 0) {
            output += `   📝 ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}\n`;
        }

        if (task.comments && task.comments.length > 0) {
            output += `   💬 ${task.comments.length} comment${task.comments.length > 1 ? 's' : ''}\n`;
        }

        output += '\n';
    });

    if (tasks.length > maxTasks) {
        output += `... and ${tasks.length - maxTasks} more tasks\n`;
    }

    output += '\n**Commands:**\n';
    output += `• \`/lara-start-task <id>\` - Start working on a task\n`;
    output += `• \`/lara-complete-task <id>\` - Mark task as completed\n`;
    output += `• \`/lara-create-task\` - Create a new task`;

    return output;
}

/**
 * Format project list for display
 */
function formatProjectList(projects) {
    if (!projects || projects.length === 0) {
        return '**🏢 No projects found**\n\nMake sure you have access to projects in LaraCollab.';
    }

    let output = `**🏢 Found ${projects.length} project${projects.length > 1 ? 's' : ''}:**\n\n`;

    projects.forEach((project, index) => {
        const clientInfo = project.client_company ? ` (${project.client_company.name})` : '';
        const status = project.active !== false ? '🟢 Active' : '🔴 Inactive';

        output += `**${index + 1}. ${project.name}**${clientInfo}\n`;
        output += `   ${status} • ID: ${project.id}\n`;

        if (project.description) {
            output += `   📝 ${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}\n`;
        }

        output += '\n';
    });

    return output;
}

/**
 * Format error message for display
 */
function formatError(message, details = null) {
    let output = `**❌ Error:** ${message}`;

    if (details) {
        output += `\n\n**Details:** ${details}`;
    }

    output += '\n\n**Troubleshooting:**\n';
    output += '• Check your API connection with `/lara-status`\n';
    output += '• Verify your configuration with `/lara-config`\n';
    output += '• Make sure you have internet access';

    return output;
}

/**
 * Format success message
 */
function formatSuccess(message, data = null) {
    let output = `**✅ ${message}**`;

    if (data) {
        output += '\n\n' + formatData(data);
    }

    return output;
}

/**
 * Format system information
 */
function formatSystemInfo(info) {
    if (!info || !info.ai_version) {
        return formatError('Unable to connect to LaraCollab API');
    }

    let output = `**🚀 LaraCollab System Information**\n\n`;
    output += `**AI Version:** ${info.ai_version}\n`;
    output += `**Laravel Version:** ${info.laravel_version || 'Unknown'}\n`;
    output += `**PHP Version:** ${info.php_version || 'Unknown'}\n`;

    if (info.user) {
        output += `\n**👤 User Information**\n`;
        output += `**Name:** ${info.user.name || 'Unknown'}\n`;
        output += `**Email:** ${info.user.email || 'Unknown'}\n`;
    }

    if (info.uptime) {
        output += `\n**📊 System Status**\n`;
        output += `**Uptime:** ${info.uptime}\n`;
        output += `**Memory Usage:** ${info.memory_usage || 'Unknown'}\n`;
    }

    return output;
}

/**
 * Format task details
 */
function formatTaskDetails(task) {
    if (!task) {
        return formatError('Task not found');
    }

    const status = getTaskStatus(task);
    const statusEmoji = getStatusEmoji(task);
    const progressBar = getProgressBar(task.progress || 0);

    let output = `**📋 Task Details: #${task.number}**\n\n`;
    output += `**Title:** ${task.name}\n`;
    output += `**Status:** ${statusEmoji} ${status}\n`;
    output += `**Progress:** ${progressBar} ${task.progress || 0}%\n`;

    if (task.project) {
        output += `**Project:** ${task.project.name}\n`;
    }

    if (task.estimation) {
        output += `**Estimation:** ${task.estimation} hours\n`;
    }

    if (task.created_at) {
        output += `**Created:** ${formatDate(task.created_at)}\n`;
    }

    if (task.completed_at) {
        output += `**Completed:** ${formatDate(task.completed_at)}\n`;
    }

    if (task.description) {
        output += `\n**Description:**\n${task.description}\n`;
    }

    if (task.time_spent) {
        output += `\n**Time Spent:** ${formatDuration(task.time_spent)}\n`;
    }

    if (task.comments && task.comments.length > 0) {
        output += `\n**Comments (${task.comments.length}):**\n`;
        task.comments.slice(0, 3).forEach(comment => {
            output += `• ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}\n`;
        });
    }

    if (task.attachments && task.attachments.length > 0) {
        output += `\n**Attachments (${task.attachments.length}):**\n`;
        task.attachments.forEach(attachment => {
            output += `• ${attachment.name}\n`;
        });
    }

    return output;
}

/**
 * Helper functions
 */
function getTaskStatus(task) {
    if (task.completed_at) return 'Completed';
    if (task.status === 'in_progress') return 'In Progress';
    if (task.status === 'pending') return 'Pending';
    return task.status || 'Unknown';
}

function getStatusEmoji(task) {
    if (task.completed_at) return '✅';
    if (task.status === 'in_progress') return '🔄';
    if (task.status === 'pending') return '⏳';
    return '❓';
}

function getProgressBar(progress) {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return ` [${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

function formatData(data, indent = 0) {
    const spaces = '  '.repeat(indent);
    let output = '';

    if (Array.isArray(data)) {
        data.forEach(item => {
            output += `${spaces}• ${item}\n`;
        });
    } else if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
            output += `${spaces}**${key}:** ${value}\n`;
        });
    } else {
        output += `${spaces}${data}\n`;
    }

    return output;
}

/**
 * Format CCPM report for display
 */
function formatCCPMReport(report) {
    let output = `**🔗 Critical Chain Project Management Report**\n\n`;

    output += `**Project:** ${report.project.name} (#${report.project.id})\n`;
    output += `**Status:** ${report.ccpm_enabled ? '✅ CCPM Enabled' : '❌ CCPM Disabled'}\n`;
    output += `**Report Date:** ${new Date().toLocaleString()}\n\n`;

    // Project Overview
    output += `**📊 Project Overview:**\n`;
    output += `- **Total Tasks:** ${report.total_tasks}\n`;
    output += `- **Critical Chain Tasks:** ${report.critical_chain_tasks}\n`;
    output += `- **Project Buffer:** ${report.project_buffer_percentage}% (${report.project_buffer_days} days)\n`;
    output += `- **Feeding Buffers:** ${report.total_feeding_buffers} (${report.total_feeding_buffer_days} days)\n`;
    output += `- **Total Buffer:** ${report.total_buffer_days} days\n`;
    output += `- **Resource Utilization:** ${report.resource_utilization_percentage}% (Target: ${report.resource_utilization_target}%)\n\n`;

    // Buffer Status
    output += `**🛡️ Buffer Status:**\n`;
    output += `- **Project Buffer Consumed:** ${report.project_buffer_consumed}%\n`;
    output += `- **Feeding Buffers Consumed:** ${report.feeding_buffers_consumed}%\n`;
    output += `- **Buffer Health:** ${getBufferHealth(report.project_buffer_consumed)}\n\n`;

    // Critical Chain Tasks
    if (report.critical_chain_tasks && report.critical_chain_tasks.length > 0) {
        output += `**⚡ Critical Chain Tasks:**\n`;
        report.critical_chain_tasks.forEach((task, index) => {
            const bufferStatus = getBufferStatus(task.buffer_consumption_percentage);
            output += `${index + 1}. **#${task.number}:** ${task.name}\n`;
            output += `   ${bufferStatus.emoji} Buffer: ${task.buffer_consumption_percentage}% (${task.feeding_buffer_days} days)\n`;
            output += `   ${getStatusEmoji(task)} ${getCCPMTaskStatus(task.ccpm_status)}\n`;
            if (task.actual_duration_days) {
                output += `   Duration: ${task.actual_duration_days}/${task.aggressive_duration_days} days\n`;
            }
            output += '\n';
        });
    }

    // Feeding Buffers
    if (report.feeding_buffers && report.feeding_buffers.length > 0) {
        output += `**🔌 Feeding Buffers:**\n`;
        report.feeding_buffers.forEach((buffer, index) => {
            const bufferStatus = getBufferStatus(buffer.consumption_percentage);
            output += `${index + 1}. **#${buffer.task_number}:** ${buffer.task_name}\n`;
            output += `   ${bufferStatus.emoji} Feeding Buffer: ${buffer.consumption_percentage}%\n`;
            output += `   Risk Level: ${buffer.risk_level}\n\n`;
        });
    }

    // Resource Analysis
    if (report.resource_analysis) {
        output += `**👥 Resource Analysis:**\n`;
        output += `- **Overall Utilization:** ${report.resource_analysis.overall_utilization}%\n`;
        output += `- **Conflicts:** ${report.resource_analysis.conflicts} conflicts detected\n`;
        if (report.resource_analysis.overloaded_resources > 0) {
            output += `- **Overloaded Resources:** ${report.resource_analysis.overloaded_resources}\n`;
        }
        output += '\n';
    }

    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
        output += `**💡 Recommendations:**\n`;
        report.recommendations.forEach((rec, index) => {
            const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
            output += `${index + 1}. ${priority} ${rec.message}\n`;
        });
        output += '\n';
    }

    // Completion Forecast
    output += `**📈 Completion Forecast:**\n`;
    output += `- **Current Forecast:** ${new Date(report.completion_forecast).toLocaleDateString()}\n`;
    output += `- **On Track:** ${report.on_track ? '✅ Yes' : '❌ No'}\n`;
    if (report.variance_days) {
        output += `- **Variance:** ${report.variance_days > 0 ? '+' : ''}${report.variance_days} days\n`;
    }

    return output;
}

/**
 * Get buffer health status
 */
function getBufferHealth(percentage) {
    if (percentage <= 25) return '🟢 Healthy';
    if (percentage <= 50) return '🟡 Caution';
    if (percentage <= 75) return '🟠 Warning';
    return '🔴 Critical';
}

/**
 * Get buffer status with emoji
 */
function getBufferStatus(percentage) {
    if (percentage <= 25) return { emoji: '🟢', status: 'Healthy' };
    if (percentage <= 50) return { emoji: '🟡', status: 'Caution' };
    if (percentage <= 75) return { emoji: '🟠', status: 'Warning' };
    return { emoji: '🔴', status: 'Critical' };
}

/**
 * Get CCPM task status
 */
function getCCPMTaskStatus(status) {
    const statusMap = {
        'not_started': 'Not Started',
        'in_progress': 'In Progress',
        'buffer_consumed': 'Buffer Consumed',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

module.exports = {
    formatTaskList,
    formatProjectList,
    formatError,
    formatSuccess,
    formatSystemInfo,
    formatTaskDetails,
    formatCCPMReport
};