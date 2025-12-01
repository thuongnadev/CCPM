/**
 * Critical Chain Project Management Commands
 */

const { formatSuccess, formatError, formatCCPMReport } = require('../../utils/formatters');

class CriticalChainCommands {
    constructor(api) {
        this.api = api;
    }

    /**
     * Analyze and identify the critical chain for a project
     */
    async analyzeCriticalChain(projectId) {
        try {
            const response = await this.api.analyzeCriticalChain(projectId);

            if (response.success) {
                const analysis = response.data;
                let output = `**🔗 Critical Chain Analysis for Project #${projectId}**\n\n`;

                output += `**Project Buffer:** ${analysis.project_buffer_days} days (${analysis.project_buffer_percentage}%)\n`;
                output += `**Critical Chain Duration:** ${analysis.critical_chain_duration} days\n`;
                output += `**Total Buffer:** ${analysis.total_buffer} days\n`;
                output += `**Resource Utilization Target:** ${analysis.resource_utilization_target}%\n\n`;

                if (analysis.critical_chain_tasks && analysis.critical_chain_tasks.length > 0) {
                    output += `**⚡ Critical Chain Tasks:**\n`;
                    analysis.critical_chain_tasks.forEach((task, index) => {
                        output += `${index + 1}. #${task.id} - ${task.name}\n`;
                        output += `   Duration: ${task.aggressive_duration_days} days (Aggressive) → ${task.safe_duration_days} days (Safe)\n`;
                        output += `   Confidence: ${(task.task_confidence_score * 100).toFixed(1)}%\n`;
                        if (task.dependencies && task.dependencies.length > 0) {
                            output += `   Dependencies: ${task.dependencies.join(', ')}\n`;
                        }
                        output += '\n';
                    });
                }

                if (analysis.feeding_buffers && analysis.feeding_buffers.length > 0) {
                    output += `**🛡️ Feeding Buffers:**\n`;
                    analysis.feeding_buffers.forEach((buffer, index) => {
                        output += `${index + 1}. ${buffer.task_name}: ${buffer.buffer_days} days\n`;
                    });
                    output += '\n';
                }

                output += `**📊 CCPM Status:** ${analysis.is_ccpm_enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
                output += `**🎯 Completion Forecast:** ${new Date(analysis.completion_forecast).toLocaleDateString()}\n`;

                return output;
            } else {
                return formatError(response.message || 'Failed to analyze critical chain');
            }
        } catch (error) {
            return formatError(`Error analyzing critical chain: ${error.message}`);
        }
    }

    /**
     * Enable CCPM for a project
     */
    async enableCCPM(projectId, settings = {}) {
        try {
            const defaultSettings = {
                project_buffer_percentage: 50,
                feeding_buffer_percentage: 25,
                resource_utilization_target: 75,
                analyze_immediately: true
            };

            const finalSettings = { ...defaultSettings, ...settings };
            const response = await this.api.enableCCPM(projectId, finalSettings);

            if (response.success) {
                const project = response.data;
                return formatSuccess(`CCPM enabled for Project #${projectId}!`, {
                    'Project Buffer': `${project.project_buffer_percentage}% (${project.project_buffer_days} days)`,
                    'Feeding Buffer': `${project.feeding_buffer_percentage}%`,
                    'Resource Utilization': `${project.resource_utilization_target}%`,
                    'Critical Chain Start': project.critical_chain_start_date ? new Date(project.critical_chain_start_date).toLocaleDateString() : 'Not set',
                    'Critical Chain End': project.critical_chain_completion_date ? new Date(project.critical_chain_completion_date).toLocaleDateString() : 'Not set'
                });
            } else {
                return formatError(response.message || 'Failed to enable CCPM');
            }
        } catch (error) {
            return formatError(`Error enabling CCPM: ${error.message}`);
        }
    }

    /**
     * Generate CCPM status report
     */
    async generateCCPMReport(projectId) {
        try {
            const response = await this.api.getCCPMReport(projectId);

            if (response.success) {
                const report = response.data;
                return formatCCPMReport(report);
            } else {
                return formatError(response.message || 'Failed to generate CCPM report');
            }
        } catch (error) {
            return formatError(`Error generating CCPM report: ${error.message}`);
        }
    }

    /**
     * Update buffer status
     */
    async updateBufferStatus(projectId, bufferData) {
        try {
            const response = await this.api.updateBufferStatus(projectId, bufferData);

            if (response.success) {
                const status = response.data;
                return formatSuccess(`Buffer status updated for Project #${projectId}!`, {
                    'Project Buffer Consumed': `${status.project_buffer_consumed}%`,
                    'Total Feeding Buffers Consumed': `${status.total_feeding_buffers_consumed}%`,
                    'Critical Tasks on Track': status.critical_tasks_on_track,
                    'Tasks in Danger': status.tasks_in_danger,
                    'Recommendation': status.recommendation
                });
            } else {
                return formatError(response.message || 'Failed to update buffer status');
            }
        } catch (error) {
            return formatError(`Error updating buffer status: ${error.message}`);
        }
    }

    /**
     * Recalculate critical chain after changes
     */
    async recalculateCriticalChain(projectId) {
        try {
            const response = await this.api.recalculateCriticalChain(projectId);

            if (response.success) {
                const result = response.data;
                let output = `**🔄 Critical Chain Recalculated for Project #${projectId}**\n\n`;

                output += `**New Critical Chain Duration:** ${result.new_duration} days\n`;
                output += `**Duration Change:** ${result.duration_change > 0 ? '+' : ''}${result.duration_change} days\n`;
                output += `**Critical Tasks Affected:** ${result.tasks_affected}\n`;
                output += `**Buffers Adjusted:** ${result.buffers_adjusted}\n\n`;

                if (result.changes && result.changes.length > 0) {
                    output += `**Changes Made:**\n`;
                    result.changes.forEach(change => {
                        output += `- ${change.task}: ${change.description}\n`;
                    });
                }

                return output;
            } else {
                return formatError(response.message || 'Failed to recalculate critical chain');
            }
        } catch (error) {
            return formatError(`Error recalculating critical chain: ${error.message}`);
        }
    }

    /**
     * Get resource loading analysis
     */
    async getResourceLoading(projectId) {
        try {
            const response = await this.api.getResourceLoading(projectId);

            if (response.success) {
                const analysis = response.data;
                let output = `**👥 Resource Loading Analysis for Project #${projectId}**\n\n`;

                output += `**Overall Resource Utilization:** ${analysis.overall_utilization}%\n`;
                output += `**Target Utilization:** ${analysis.target_utilization}%\n`;
                output += `**Status:** ${analysis.utilization_status}\n\n`;

                if (analysis.resources && analysis.resources.length > 0) {
                    output += `**Resource Details:**\n`;
                    analysis.resources.forEach(resource => {
                        output += `- ${resource.name}: ${resource.utilization}% (${resource.tasks_assigned} tasks)\n`;
                        if (resource.utilization > 85) {
                            output += `  ⚠️ Overloaded\n`;
                        } else if (resource.utilization < 50) {
                            output += `  ℹ️ Underutilized\n`;
                        }
                    });
                    output += '\n';
                }

                if (analysis.conflicts && analysis.conflicts.length > 0) {
                    output += `**🚨 Resource Conflicts:**\n`;
                    analysis.conflicts.forEach(conflict => {
                        output += `- ${conflict.resource}: ${conflict.description}\n`;
                    });
                }

                return output;
            } else {
                return formatError(response.message || 'Failed to get resource loading');
            }
        } catch (error) {
            return formatError(`Error getting resource loading: ${error.message}`);
        }
    }

    /**
     * Identify tasks that need feeding buffers
     */
    async identifyFeedingBuffers(projectId) {
        try {
            const response = await this.api.identifyFeedingBuffers(projectId);

            if (response.success) {
                const buffers = response.data;
                let output = `**🛡️ Feeding Buffer Analysis for Project #${projectId}**\n\n`;

                if (buffers.required_buffers && buffers.required_buffers.length > 0) {
                    output += `**Tasks Requiring Feeding Buffers:**\n`;
                    buffers.required_buffers.forEach((buffer, index) => {
                        output += `${index + 1}. #${buffer.task_id} - ${buffer.task_name}\n`;
                        output += `   Suggested Buffer: ${buffer.suggested_buffer_days} days\n`;
                        output += `   Risk Level: ${buffer.risk_level}\n`;
                        output += `   Reason: ${buffer.reason}\n\n`;
                    });
                }

                if (buffers.existing_buffers && buffers.existing_buffers.length > 0) {
                    output += `**Existing Feeding Buffers:**\n`;
                    buffers.existing_buffers.forEach(buffer => {
                        output += `- #${buffer.task_id} - ${buffer.task_name}: ${buffer.buffer_days} days\n`;
                    });
                    output += '\n';
                }

                output += `**Total Buffer Days:** ${buffers.total_buffer_days}\n`;
                output += `**Buffer Percentage:** ${buffers.buffer_percentage}%`;

                return output;
            } else {
                return formatError(response.message || 'Failed to identify feeding buffers');
            }
        } catch (error) {
            return formatError(`Error identifying feeding buffers: ${error.message}`);
        }
    }
}

module.exports = CriticalChainCommands;