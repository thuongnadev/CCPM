/**
 * Configuration Manager for CCPM Plugin
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ConfigManager {
    constructor() {
        this.configPath = path.join(os.homedir(), '.claude', 'ccpm.json');
        this.config = {};
    }

    /**
     * Load configuration from file
     */
    async loadConfig() {
        try {
            const data = await fs.readFile(this.configPath, 'utf8');
            this.config = JSON.parse(data);
            return this.config;
        } catch (error) {
            // If file doesn't exist, create with default config
            if (error.code === 'ENOENT') {
                await this.saveConfig(this.getDefaultConfig());
                return this.config;
            }
            throw error;
        }
    }

    /**
     * Save configuration to file
     */
    async saveConfig(config = null) {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        try {
            // Ensure directory exists
            await fs.mkdir(path.dirname(this.configPath), { recursive: true });

            // Write configuration
            await fs.writeFile(
                this.configPath,
                JSON.stringify(this.config, null, 2),
                'utf8'
            );

            return this.config;
        } catch (error) {
            throw new Error(`Failed to save configuration: ${error.message}`);
        }
    }

    /**
     * Get configuration value
     */
    get(key, defaultValue = null) {
        return this.config[key] || defaultValue;
    }

    /**
     * Set configuration value
     */
    set(key, value) {
        this.config[key] = value;
    }

    /**
     * Check if plugin is configured
     */
    isConfigured() {
        return !!(this.config.baseUrl && this.config.apiToken);
    }

    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Reset configuration to defaults
     */
    async reset() {
        this.config = this.getDefaultConfig();
        await this.saveConfig();
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            baseUrl: '',
            apiToken: '',
            timeout: 30,
            lastSync: null,
            defaultProjectId: null,
            autoStartTasks: false,
            notifications: true,
            timeTracking: {
                enabled: true,
                roundToNearest: 15, // minutes
                autoStop: false
            },
            display: {
                showCompletedTasks: true,
                tasksPerPage: 20,
                sortBy: 'created_at',
                sortOrder: 'desc'
            }
        };
    }

    /**
     * Validate configuration
     */
    validateConfig(config) {
        const errors = [];

        if (!config.baseUrl) {
            errors.push('Base URL is required');
        } else {
            try {
                new URL(config.baseUrl);
            } catch {
                errors.push('Invalid base URL format');
            }
        }

        if (!config.apiToken) {
            errors.push('API token is required');
        } else if (config.apiToken.length < 10) {
            errors.push('API token appears to be invalid (too short)');
        }

        if (config.timeout && (config.timeout < 5 || config.timeout > 300)) {
            errors.push('Timeout must be between 5 and 300 seconds');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Export configuration for backup
     */
    async exportConfig(filePath) {
        try {
            const exportData = {
                ...this.config,
                apiToken: this.config.apiToken ? '[REDACTED]' : null,
                exportedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');
            return true;
        } catch (error) {
            throw new Error(`Failed to export configuration: ${error.message}`);
        }
    }

    /**
     * Import configuration from backup
     */
    async importConfig(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const importData = JSON.parse(data);

            // Remove import-specific fields
            delete importData.exportedAt;
            delete importData.version;

            // Validate imported config
            const validation = this.validateConfig(importData);
            if (!validation.valid) {
                throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
            }

            this.config = importData;
            await this.saveConfig();

            return true;
        } catch (error) {
            throw new Error(`Failed to import configuration: ${error.message}`);
        }
    }
}

module.exports = ConfigManager;