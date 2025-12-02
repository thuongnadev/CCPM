# CCPM Plugin for Claude Code

Seamlessly integrate CCPM project management with Claude Code for enhanced productivity and streamlined workflow management.

## 🚀 Features

- **Task Management** - View, create, start, and complete tasks directly from Claude Code
- **Project Overview** - Browse all your projects and their details
- **Time Tracking** - Track time spent on tasks automatically
- **Real-time Updates** - Sync changes instantly with your CCPM instance
- **Smart Formatting** - Beautiful, readable task and project displays
- **Configuration Management** - Secure token storage and connection management

## 📋 Requirements

- Claude Code installed and configured
- Access to a CCPM instance (version 1.0+)
- API token from your CCPM account
- Node.js 16+ (for plugin runtime)

## 🔧 Installation

### Install via Claude Code Marketplace

```bash
claude-code plugin install ccpm
```

### Manual Installation

1. Clone or download this plugin
2. Install the plugin locally:
```bash
claude-code plugin install /path/to/ccpm-plugin
```

## ⚙️ Configuration

After installation, configure your LaraCollab connection:

```bash
/lara-config
```

You'll need:
- **Base URL**: Your CCPM instance URL (e.g., `https://your-ccpm.com`)
- **API Token**: Generate this from your CCPM user settings
- **Timeout**: Request timeout in seconds (default: 30)

## 📚 Available Commands

### Task Management

#### `/lara-tasks` - List all tasks
```bash
/lara-tasks                    # Show all tasks
/lara-tasks completed          # Show completed tasks only
/lara-tasks pending            # Show pending tasks only
/lara-tasks urgent             # Show urgent tasks only
```

#### `/lara-create-task` - Create a new task
```bash
/lara-create-task Fix authentication bug project:1 estimate:2
/lara-create-task Implement new dashboard feature project:2
```

#### `/lara-start-task` - Start working on a task
```bash
/lara-start-task 123           # Start task with ID 123
```

#### `/lara-complete-task` - Mark a task as completed
```bash
/lara-complete-task 123 "Fixed the authentication issue successfully"
/lara-complete-task 456 "Added user registration and email verification"
```

### Project Management

#### `/lara-projects` - List all projects
```bash
/lara-projects                 # Show all available projects
```

### System & Configuration

#### `/lara-status` - Check connection status
```bash
/lara-status                   # Display API connection info
```

#### `/lara-config` - Configure plugin settings
```bash
/lara-config                   # Interactive configuration setup
```

## 🎯 Usage Examples

### Daily Workflow

1. **Check your tasks for the day:**
```bash
/lara-tasks pending
```

2. **Start working on a task:**
```bash
/lara-start-task 123
```

3. **Complete the task when done:**
```bash
/lara-complete-task 123 "Implemented user authentication with JWT"
```

### Project Management

1. **View all projects:**
```bash
/lara-projects
```

2. **Create a new task in a specific project:**
```bash
/lara-create-task "Add user profile page" project:2 estimate:4
```

3. **Monitor task progress:**
```bash
/lara-tasks project:2
```

## 🔐 Security

- API tokens are stored securely in your local Claude Code configuration
- Tokens are never transmitted to third-party services
- All communication happens directly between Claude Code and your LaraCollab instance
- Support for self-signed certificates for on-premises deployments

## 🛠️ Advanced Configuration

The plugin stores configuration in `~/.claude/ccpm.json`:

```json
{
  "baseUrl": "https://your-ccpm.com",
  "apiToken": "your-api-token",
  "timeout": 30,
  "defaultProjectId": 1,
  "autoStartTasks": false,
  "notifications": true,
  "timeTracking": {
    "enabled": true,
    "roundToNearest": 15,
    "autoStop": false
  },
  "display": {
    "showCompletedTasks": true,
    "tasksPerPage": 20,
    "sortBy": "created_at",
    "sortOrder": "desc"
  }
}
```

## 🐛 Troubleshooting

### Connection Issues

1. **Check your configuration:**
```bash
/lara-status
```

2. **Verify API endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-ccpm.com/api/ai/info
```

3. **Reconfigure the plugin:**
```bash
/lara-config
```

### Common Errors

- **401 Unauthorized**: Check your API token
- **404 Not Found**: Verify your base URL and API version
- **Timeout**: Increase timeout setting in configuration
- **CORS Error**: Ensure your LaraCollab instance allows requests from Claude Code

## 📝 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/ccpm/claude-code-plugin.git
cd claude-code-plugin

# Install dependencies
npm install

# Test locally
claude-code plugin install --dev .

# Build for production
npm run build
```

### Plugin Structure

```
ccpm-plugin/
├── plugin.json              # Plugin metadata
├── index.js                 # Main plugin entry point
├── src/
│   ├── api-client.js        # CCPM API client
│   ├── config.js           # Configuration manager
│   ├── commands/           # Command handlers
│   └── utils/
│       └── formatters.js   # Output formatting
├── README.md               # This file
└── package.json            # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This plugin is released under the MIT License. See [LICENSE](LICENSE) for details.

## 🔗 Links

- **CCPM Website**: https://ccpm.com
- **Documentation**: https://docs.ccpm.com
- **Claude Code**: https://claude.ai/claude-code
- **Plugin Repository**: https://github.com/ccpm/claude-code-plugin
- **Issue Tracker**: https://github.com/ccpm/claude-code-plugin/issues

## 🆘 Support

If you encounter issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/ccpm/claude-code-plugin/issues)
3. Create a new issue with detailed information
4. Contact CCPM support at support@ccpm.com

## 📊 Changelog

### Version 1.0.0
- Initial release
- Task management commands
- Project overview
- Time tracking integration
- Configuration management
- Comprehensive error handling

---

**Made with ❤️ by the CCPM team**