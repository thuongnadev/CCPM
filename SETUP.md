# 🚀 CCPM Plugin Setup Guide

## 📋 Prerequisites

Before you can use the CCPM plugin, you need:

### 1. CCPM Instance
- A running CCPM installation (v1.0+)
- Admin access to generate API tokens
- Access to the API endpoints

### 2. Claude Code Installed
- Claude Code CLI installed and working
- User account with plugin installation permissions

### 3. API Token from CCPM
Generate a Sanctum token from your CCPM instance:

1. **Login to CCPM as admin**
2. **Go to Settings → API Tokens**
3. **Create new token** with permissions:
   - `ai:read` - Read tasks and projects
   - `ai:write` - Create and update tasks
   - `projects:read` - Read project information
4. **Copy the token** - you'll need it for setup

## 🔧 Installation Methods

### Method 1: Direct from GitHub (Recommended for development)

```bash
# Clone the repository
git clone https://github.com/yourusername/ccpm-plugin.git
cd ccpm-plugin

# Install dependencies
npm install

# Install plugin in Claude Code
claude-code plugin install .
```

### Method 2: From URL

```bash
# Install directly from GitHub repository
claude-code plugin install https://github.com/yourusername/ccpm-plugin.git
```

### Method 3: From Marketplace (When published)

```bash
# Install from Claude Code marketplace
claude-code plugin install ccpm
```

## ⚙️ Initial Configuration

After installation, configure the plugin:

### 1. Run Configuration Command

```bash
/lara-config
```

### 2. Provide Required Information

**Base URL:**
- Your LaraCollab instance URL
- Example: `https://yourcompany.laracollab.com`
- Example: `https://laracollab.yourcompany.com`

**API Token:**
- The Sanctum token you generated earlier
- Should be a long string (50+ characters)
- Keep this secure and don't share it

**Timeout:**
- Request timeout in seconds
- Recommended: 30 seconds
- Range: 5-300 seconds

### 3. Example Configuration Session

```bash
/lara-config

🔧 CCPM Configuration

? Enter your CCPM base URL: https://mycompany.ccpm.com
? Enter your CCPM API token: [hidden]
? Request timeout (seconds): 30

✅ CCPM configured successfully!

Base URL: https://mycompany.ccpm.com
Timeout: 30s

Next steps:
- Try /lara-tasks to see your tasks
- Try /lara-projects to see available projects
- Try /lara-create-task to create a new task
```

## ✅ Verification

Test your configuration:

### 1. Check Connection Status

```bash
/lara-status
```

**Expected output:**
```
🚀 CCPM System Information

AI Version: 1.0.0
Laravel Version: 10.0.0
PHP Version: 8.2.0

👤 User Information
Name: John Doe
Email: john@company.com
```

### 2. Test Basic Commands

```bash
# List all projects
/lara-projects

# List your tasks
/lara-tasks

# Create a test task
/lara-create-task "Test plugin integration" project:1 estimate:1
```

## 🛠️ Available Commands

### Task Management
```bash
/lara-tasks                    # List all tasks
/lara-tasks completed          # Show completed tasks only
/lara-tasks pending            # Show pending tasks only
/lara-tasks urgent             # Show urgent tasks only
/lara-tasks project:2          # Show tasks from specific project

/lara-create-task "Task name" project:1 estimate:2 type:hourly
/lara-start-task 123
/lara-complete-task 123 "Task completed successfully"
```

### Project Management
```bash
/lara-projects                 # List all available projects
```

### System & Configuration
```bash
/lara-status                   # Check connection and system info
/lara-config                   # Reconfigure plugin settings
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Failed
**Error:** `Connection test failed`

**Solutions:**
- Check your CCPM URL is correct
- Ensure your CCPM instance is accessible
- Verify your API token is valid
- Check if token has required permissions

#### 2. 401 Unauthorized
**Error:** `API Error (401): Unauthorized`

**Solutions:**
- Regenerate your API token
- Ensure token has `ai:*` permissions
- Check token hasn't expired

#### 3. 404 Not Found
**Error:** `API Error (404): Not Found`

**Solutions:**
- Verify your base URL includes the full domain
- Check if CCPM API is enabled
- Ensure running CCPM v1.0+

#### 4. Timeout Issues
**Error:** `Request timeout`

**Solutions:**
- Increase timeout setting with `/lara-config`
- Check network connectivity
- Verify server performance

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export DEBUG=ccpm

# Run commands with verbose output
/lara-tasks
```

### Reset Configuration

If you need to start over:

```bash
# Remove configuration file
rm ~/.claude/ccpm.json

# Reconfigure
/lara-config
```

## 📚 Advanced Configuration

### Configuration File Location

Your settings are stored in:
- **Linux/Mac:** `~/.claude/ccpm.json`
- **Windows:** `%USERPROFILE%\.claude\ccpm.json`

### Manual Configuration

You can edit the configuration file directly:

```json
{
  "baseUrl": "https://yourcompany.ccpm.com",
  "apiToken": "your-sanctum-token-here",
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

### Environment Variables

You can also use environment variables:

```bash
export CCPM_BASE_URL="https://yourcompany.ccpm.com"
export CCPM_API_TOKEN="your-token-here"
export CCPM_TIMEOUT="30"
```

## 🔐 Security Best Practices

1. **Protect Your API Token:**
   - Never share your API token
   - Don't commit tokens to version control
   - Use environment variables in production

2. **Token Permissions:**
   - Grant minimum required permissions
   - Regularly rotate API tokens
   - Monitor token usage logs

3. **Network Security:**
   - Use HTTPS URLs only
   - Consider VPN for remote access
   - Monitor API access logs

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Enable debug mode** and review logs
3. **Test API directly:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://yourdomain.com/api/ai/info
   ```
4. **Create an issue** on the GitHub repository
5. **Contact CCPM support** at support@ccpm.com

## 📖 Next Steps

Once configured:

1. **Explore your tasks:** `/lara-tasks`
2. **Start working:** `/lara-start-task [id]`
3. **Track progress:** `/lara-status`
4. **Create new tasks:** `/lara-create-task "description"`
5. **Complete work:** `/lara-complete-task [id] "notes"`

Happy coding with CCPM! 🚀