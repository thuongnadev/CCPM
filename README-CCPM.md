# Critical Chain Project Management (CCPM) Plugin

Enhanced Project Management System plugin with advanced Critical Chain Project Management capabilities for Claude Code.

## Features

### 🚀 Critical Chain Project Management
- **Critical Chain Analysis**: Automatically identify the critical path and optimize task scheduling
- **Buffer Management**: Smart project and feeding buffer allocation and monitoring
- **Resource Optimization**: Advanced resource loading analysis and conflict detection
- **Capacity Planning**: Optimize resource utilization based on realistic constraints

### 📊 Buffer Management
- **Project Buffers**: Protects the overall project delivery date
- **Feeding Buffers**: Protects critical chain tasks from delays
- **Buffer Consumption Monitoring**: Real-time tracking of buffer usage
- **Health Indicators**: Visual status indicators for buffer health

### 🎯 Resource Management
- **Resource Loading Analysis**: Track resource utilization across all tasks
- **Conflict Detection**: Identify resource scheduling conflicts
- **Capacity Planning**: Optimize resource allocation based on availability
- **Utilization Targets**: Set and monitor optimal resource utilization

### ⚡ Advanced Commands

#### CCPM Core Commands
- `/ccpm-enable <project-id>` - Enable CCPM for a project
- `/ccpm-analyze <project-id>` - Analyze critical chain
- `/ccpm-report <project-id>` - Generate comprehensive CCPM report
- `/ccpm-resources <project-id>` - Get resource loading analysis

#### Buffer Management
- `/ccpm-buffers <project-id>` - Identify feeding buffers needed
- `/ccpm-update-buffer <task-id> <percentage>` - Update buffer status

#### Analysis & Planning
- `/ccpm-recalculate <project-id>` - Recalculate critical chain after changes
- `/ccpm-dashboard` - Get overall CCPM dashboard

### 📈 CCPM Methodology

This plugin implements the core principles of Critical Chain Project Management:

1. **Focus on Constraints**: Identify and manage the critical chain
2. **Buffer Management**: Protect project completion through strategic buffers
3. **Resource Optimization**: Balance workload and minimize multitasking
4. **Realistic Planning**: Use aggressive durations with buffer protection

### 🔧 Configuration

Enable CCPM with customizable settings:
- Project buffer percentage (default: 50%)
- Feeding buffer percentage (default: 25%)
- Resource utilization target (default: 75%)
- Auto-analysis on changes

### 📋 Usage Examples

```bash
# Enable CCPM for project 123
/ccpm-enable 123 project-buffer:40 feeding-buffer:20 resource-utilization:80

# Analyze critical chain
/ccpm-analyze 123

# Generate comprehensive report
/ccpm-report 123

# Check resource loading
/ccpm-resources 123

# Update buffer status
/ccpm-update-buffer 456 75

# Get CCPM dashboard
/ccpm-dashboard
```

### 🎨 Visual Indicators

- 🟢 **Healthy**: Buffer consumption ≤ 25%
- 🟡 **Caution**: Buffer consumption 26-50%
- 🟠 **Warning**: Buffer consumption 51-75%
- 🔴 **Critical**: Buffer consumption > 75%

### 🏗️ Architecture

The plugin integrates with multiple PM systems:
- **LaraCollab**: Native integration with full CCPM support
- **Jira**: Custom field integration for CCPM data
- **Asana**: Custom attributes for buffer management
- **Trello**: Labels and custom fields for CCPM tracking
- **Custom API**: Flexible REST API integration

### 📊 Reporting

Generate comprehensive CCPM reports including:
- Project overview and buffer status
- Critical chain task analysis
- Feeding buffer consumption
- Resource utilization metrics
- Completion forecasts
- Risk assessments
- Actionable recommendations

### 🔗 Integration

The plugin seamlessly integrates with:
- LaraCollab PM system
- Time tracking modules
- Resource allocation systems
- Risk assessment tools
- Project analytics dashboards

## Getting Started

1. **Install Plugin**: `/plugin install ccpm-plugin`
2. **Configure PM System**: `/pms-config`
3. **Enable CCPM**: `/ccpm-enable <project-id>`
4. **Analyze Project**: `/ccpm-analyze <project-id>`
5. **Monitor Buffers**: `/ccpm-report <project-id>`

## Benefits

- **Improved Project Predictability**: Buffer management reduces delivery variance
- **Optimized Resource Utilization**: Better allocation and reduced conflicts
- **Enhanced Risk Management**: Early warning system for project delays
- **Increased Project Success Rate**: CCPM methodology proven to improve outcomes
- **Better Decision Making**: Real-time data for project management decisions

## Contributing

Contributions are welcome! Please see the contributing guidelines for details.

## License

MIT License - see LICENSE file for details.

## Repository

https://github.com/thuongnadev/CCPM

## Support

For issues and feature requests, please visit:
https://github.com/thuongnadev/CCPM/issues