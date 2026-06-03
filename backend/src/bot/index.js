import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import Project from '../models/Project.js';
import Profile from '../models/Profile.js';

dotenv.config();

const logger = {
  _fmt: (level, msg, extra) => {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level}] ${msg}`;
    return extra ? `${base} ${JSON.stringify(extra)}` : base;
  },
  info:  (msg, extra) => console.log(logger._fmt('INFO ', msg, extra)),
  warn:  (msg, extra) => console.warn(logger._fmt('WARN ', msg, extra)),
  error: (msg, extra) => console.error(logger._fmt('ERROR', msg, extra)),
};

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  logger.error('TELEGRAM_BOT_TOKEN environment variable is required');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const projectModel = new Project();
const profileModel = new Profile();

// Bot commands
const commands = [
  { command: 'start', description: 'Start the bot and see available commands' },
  { command: 'list', description: 'List all projects' },
  { command: 'add', description: 'Add a new project' },
  { command: 'edit', description: 'Edit an existing project' },
  { command: 'status', description: 'Change project status' },
  { command: 'delete', description: 'Delete a project' },
  { command: 'profile', description: 'Edit profile settings (name, intro, links)' },
  { command: 'help', description: 'Show this help message' }
];

// Set bot commands
bot.setMyCommands(commands);

// State management for multi-step interactions
const userStates = new Map();

// Helper functions
const formatProject = (project) => {
  const tags = Array.isArray(project.tags) ? project.tags.join(', ') : 'No tags';
  return `📱 *${project.name}*\n` +
         `📝 ${project.description}\n` +
         `🔗 [Link](${project.href})\n` +
         `🏷️ Tags: ${tags}\n` +
         `📊 Status: ${project.status}\n` +
         `🆔 ID: ${project.id}`;
};

const showProjects = async (chatId, status = null) => {
  try {
    let projects;
    if (status) {
      projects = await projectModel.getProjectsByStatus(status);
    } else {
      projects = await projectModel.getAllProjects();
    }

    if (projects.length === 0) {
      const message = status ? `No projects with status "${status}"` : 'No projects found';
      bot.sendMessage(chatId, message);
      return;
    }

    const message = projects.map(formatProject).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
  } catch (error) {
    logger.error('Error fetching projects', { chatId, message: error.message });
    bot.sendMessage(chatId, '❌ Error fetching projects. Please try again.');
  }
};

// Command handlers
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/start', { chatId, username: msg.from?.username });
  const welcomeMessage = `
🚀 *Welcome to Tem's Project Manager Bot!*

I can help you manage your portfolio projects. Here are the available commands:

/list - Show all projects
/add - Add a new project
/edit - Edit an existing project
/status - Change project status
/delete - Delete a project
/profile - Edit profile settings
/help - Show this help message

Get started by typing /list to see your current projects!
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/help', { chatId, username: msg.from?.username });
  const helpMessage = commands
    .map(cmd => `/${cmd.command} - ${cmd.description}`)
    .join('\n');
  
  bot.sendMessage(chatId, `🤖 *Available Commands:*\n\n${helpMessage}`, { parse_mode: 'Markdown' });
});

bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/list', { chatId, username: msg.from?.username });
  showProjects(chatId);
});

bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/add', { chatId, username: msg.from?.username });
  userStates.set(chatId, { action: 'add', step: 'name' });
  bot.sendMessage(chatId, '📱 *Adding new project*\n\nPlease enter the project name:', { parse_mode: 'Markdown' });
});

bot.onText(/\/edit/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/edit', { chatId, username: msg.from?.username });
  userStates.set(chatId, { action: 'edit', step: 'select' });
  bot.sendMessage(chatId, '✏️ *Edit project*\n\nPlease enter the project ID you want to edit:', { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/status', { chatId, username: msg.from?.username });
  userStates.set(chatId, { action: 'status', step: 'select' });
  bot.sendMessage(chatId, '📊 *Change project status*\n\nPlease enter the project ID:', { parse_mode: 'Markdown' });
});

bot.onText(/\/delete/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/delete', { chatId, username: msg.from?.username });
  userStates.set(chatId, { action: 'delete', step: 'select' });
  bot.sendMessage(chatId, '🗑️ *Delete project*\n\nPlease enter the project ID you want to delete:', { parse_mode: 'Markdown' });
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  logger.info('/profile', { chatId, username: msg.from?.username });
  
  try {
    const profile = await profileModel.getProfile();
    logger.info('/profile fetched successfully', { chatId });
    userStates.set(chatId, { action: 'profile', step: 'select' });
    
    // Escape Markdown special characters in user-controlled values so the
    // message doesn't fail to parse (e.g. underscores in URLs).
    const esc = (s) => String(s).replace(/[_*`\[]/g, '\\$&');

    const profileMessage = `👤 *Current Profile Settings:*\n\n` +
                          `*Name:* ${esc(profile.name)}\n` +
                          `*Intro:* ${esc(profile.intro)}\n` +
                          `*Twitter URL:* ${esc(profile.twitter_url)}\n` +
                          `*Twitter Label:* ${esc(profile.twitter_label)}\n\n` +
                          `What would you like to edit?`;
    
    const options = [
      ['name', 'intro'],
      ['twitter_url', 'twitter_label'],
      ['done']
    ];
    
    await bot.sendMessage(chatId, profileMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  } catch (error) {
    logger.error('Error in /profile command', { chatId, message: error.message, stack: error.stack });
    bot.sendMessage(chatId, '❌ Error fetching profile. Please try again.');
  }
});

// Handle text messages (multi-step interactions)
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // Skip commands
  
  const chatId = msg.chat.id;
  const state = userStates.get(chatId);
  
  if (!state) return;

  logger.info('message', { chatId, action: state.action, step: state.step, text: msg.text });

  try {
    if (state.action === 'add') {
      await handleAddProject(chatId, msg.text, state);
    } else if (state.action === 'edit') {
      await handleEditProject(chatId, msg.text, state);
    } else if (state.action === 'status') {
      await handleStatusChange(chatId, msg.text, state);
    } else if (state.action === 'delete') {
      await handleDeleteProject(chatId, msg.text, state);
    } else if (state.action === 'profile') {
      await handleProfileEdit(chatId, msg.text, state);
    }
  } catch (error) {
    logger.error('Error handling message', { chatId, action: state.action, step: state.step, message: error.message, stack: error.stack });
    bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
    userStates.delete(chatId);
  }
});

// Add project handler
const handleAddProject = async (chatId, text, state) => {
  if (state.step === 'name') {
    state.project = { name: text };
    state.step = 'description';
    bot.sendMessage(chatId, '📝 Now enter the project description:');
  } else if (state.step === 'description') {
    state.project.description = text;
    state.step = 'icon';
    bot.sendMessage(chatId, '🎨 Enter the icon URL (or type "skip"):');
  } else if (state.step === 'icon') {
    if (text.toLowerCase() !== 'skip') {
      state.project.icon = text;
    }
    state.step = 'href';
    bot.sendMessage(chatId, '🔗 Enter the project link (or type "skip"):');
  } else if (state.step === 'href') {
    if (text.toLowerCase() !== 'skip') {
      state.project.href = text;
    }
    state.step = 'tags';
    bot.sendMessage(chatId, '🏷️ Enter tags separated by commas (or type "skip"):');
  } else if (state.step === 'tags') {
    if (text.toLowerCase() !== 'skip') {
      state.project.tags = text.split(',').map(tag => tag.trim());
    }
    state.step = 'status';
    
    const statusOptions = [
      ['current', 'wip'],
      ['in_review', 'completed'],
      ['archived', 'cancelled']
    ];
    
    bot.sendMessage(chatId, '📊 Select project status:', {
      reply_markup: {
        keyboard: statusOptions,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  } else if (state.step === 'status') {
    state.project.status = text;
    
    // Create the project
    const project = await projectModel.createProject(state.project);
    bot.sendMessage(chatId, `✅ *Project created successfully!*\n\n${formatProject(project)}`, {
      parse_mode: 'Markdown',
      reply_markup: { remove_keyboard: true }
    });
    
    userStates.delete(chatId);
  }
};

// Edit project handler
const handleEditProject = async (chatId, text, state) => {
  if (state.step === 'select') {
    const projectId = parseInt(text);
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      bot.sendMessage(chatId, '❌ Project not found. Please try again with a valid ID.');
      return;
    }
    
    state.project = project;
    state.projectId = projectId;
    state.step = 'field';
    
    const options = [
      ['name', 'description'],
      ['icon', 'href'],
      ['tags', 'status'],
      ['done']
    ];
    
    bot.sendMessage(chatId, `📝 *Editing: ${project.name}*\n\nWhat would you like to edit?`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  } else if (state.step === 'field') {
    if (text === 'done') {
      bot.sendMessage(chatId, '✅ Editing completed!', {
        reply_markup: { remove_keyboard: true }
      });
      userStates.delete(chatId);
      return;
    }
    
    state.field = text;
    state.step = 'value';
    bot.sendMessage(chatId, `Enter new ${text}:`, {
      reply_markup: { remove_keyboard: true }
    });
  } else if (state.step === 'value') {
    const updates = {};
    
    if (state.field === 'tags') {
      updates.tags = text.split(',').map(tag => tag.trim());
    } else {
      updates[state.field] = text;
    }
    
    const updatedProject = await projectModel.updateProject(state.projectId, updates);
    
    bot.sendMessage(chatId, `✅ *${state.field} updated!*\n\n${formatProject(updatedProject)}`, {
      parse_mode: 'Markdown'
    });
    
    // Go back to field selection
    state.step = 'field';
    const options = [
      ['name', 'description'],
      ['icon', 'href'],
      ['tags', 'status'],
      ['done']
    ];
    
    bot.sendMessage(chatId, 'What else would you like to edit?', {
      reply_markup: {
        keyboard: options,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }
};

// Status change handler
const handleStatusChange = async (chatId, text, state) => {
  if (state.step === 'select') {
    const projectId = parseInt(text);
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      bot.sendMessage(chatId, '❌ Project not found. Please try again with a valid ID.');
      return;
    }
    
    state.projectId = projectId;
    state.step = 'status';
    
    const statusOptions = [
      ['current', 'wip'],
      ['in_review', 'completed'],
      ['archived', 'cancelled']
    ];
    
    bot.sendMessage(chatId, `📊 *Current status: ${project.status}*\n\nSelect new status:`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: statusOptions,
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  } else if (state.step === 'status') {
    const updatedProject = await projectModel.updateProject(state.projectId, { status: text });
    
    bot.sendMessage(chatId, `✅ *Status updated!*\n\n${formatProject(updatedProject)}`, {
      parse_mode: 'Markdown',
      reply_markup: { remove_keyboard: true }
    });
    
    userStates.delete(chatId);
  }
};

// Delete project handler
const handleDeleteProject = async (chatId, text, state) => {
  if (state.step === 'select') {
    const projectId = parseInt(text);
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      bot.sendMessage(chatId, '❌ Project not found. Please try again with a valid ID.');
      return;
    }
    
    state.projectId = projectId;
    state.project = project;
    state.step = 'confirm';
    
    bot.sendMessage(chatId, `🗑️ *Are you sure you want to delete this project?*\n\n${formatProject(project)}\n\nType "yes" to confirm or "no" to cancel.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [['yes', 'no']],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  } else if (state.step === 'confirm') {
    if (text.toLowerCase() === 'yes') {
      await projectModel.deleteProject(state.projectId);
      bot.sendMessage(chatId, `✅ Project "${state.project.name}" has been deleted.`, {
        reply_markup: { remove_keyboard: true }
      });
    } else {
      bot.sendMessage(chatId, '❌ Deletion cancelled.', {
        reply_markup: { remove_keyboard: true }
      });
    }
    
    userStates.delete(chatId);
  }
};

// Profile edit handler
const handleProfileEdit = async (chatId, text, state) => {
  if (state.step === 'select') {
    if (text === 'done') {
      bot.sendMessage(chatId, '✅ Profile editing completed!', {
        reply_markup: { remove_keyboard: true }
      });
      userStates.delete(chatId);
      return;
    }
    
    state.field = text;
    state.step = 'value';
    
    const fieldLabels = {
      name: 'display name',
      intro: 'intro text',
      twitter_url: 'Twitter URL',
      twitter_label: 'Twitter link label'
    };
    
    bot.sendMessage(chatId, `Enter new ${fieldLabels[text] || text}:`, {
      reply_markup: { remove_keyboard: true }
    });
  } else if (state.step === 'value') {
    try {
      await profileModel.updateSetting(state.field, text);
      
      bot.sendMessage(chatId, `✅ *${state.field} updated successfully!*`, {
        parse_mode: 'Markdown'
      });
      
      // Go back to field selection
      state.step = 'select';
      const options = [
        ['name', 'intro'],
        ['twitter_url', 'twitter_label'],
        ['done']
      ];
      
      bot.sendMessage(chatId, 'What else would you like to edit?', {
        reply_markup: {
          keyboard: options,
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    } catch (error) {
      logger.error('Error updating profile setting', { chatId, field: state.field, message: error.message, stack: error.stack });
      bot.sendMessage(chatId, '❌ Error updating setting. Please try again.');
      userStates.delete(chatId);
    }
  }
};

logger.info('Telegram bot started successfully');
logger.info('Bot username: @' + (await bot.getMe()).username);

export default bot;