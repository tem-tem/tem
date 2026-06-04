import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
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

// Gemini setup
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = 'gemini-3.1-flash-lite';

// Per-user conversation history for Gemini
const chatHistories = new Map();

const geminiTools = [
  {
    functionDeclarations: [
      {
        name: 'list_projects',
        description: 'Get all projects, optionally filtered by status',
        parameters: {
          type: 'OBJECT',
          properties: {
            status: {
              type: 'STRING',
              description: 'Optional status filter: current, wip, in_review, completed, archived, cancelled',
            },
          },
        },
      },
      {
        name: 'get_project',
        description: 'Get a single project by its numeric ID',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: { type: 'NUMBER', description: 'Project ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'create_project',
        description: 'Create a new portfolio project',
        parameters: {
          type: 'OBJECT',
          properties: {
            name:        { type: 'STRING', description: 'Project name' },
            description: { type: 'STRING', description: 'Short description' },
            href:        { type: 'STRING', description: 'URL link to the project' },
            icon:        { type: 'STRING', description: 'Icon URL' },
            tags:        { type: 'ARRAY', items: { type: 'STRING' }, description: 'List of tags' },
            status:      { type: 'STRING', description: 'Status: current, wip, in_review, completed, archived, cancelled' },
          },
          required: ['name', 'description'],
        },
      },
      {
        name: 'update_project',
        description: 'Update one or more fields of an existing project by ID',
        parameters: {
          type: 'OBJECT',
          properties: {
            id:           { type: 'NUMBER', description: 'Project ID to update' },
            name:         { type: 'STRING' },
            description:  { type: 'STRING' },
            href:         { type: 'STRING' },
            icon:         { type: 'STRING' },
            tags:         { type: 'ARRAY', items: { type: 'STRING' } },
            status:       { type: 'STRING', description: 'Status: current, wip, in_review, completed, archived, cancelled' },
            display_order:{ type: 'NUMBER', description: 'Display order (lower = first)' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_project',
        description: 'Delete a project by its numeric ID',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: { type: 'NUMBER', description: 'Project ID to delete' },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_profile',
        description: 'Get the current portfolio profile settings',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'update_profile',
        description: 'Update profile settings (name, intro, twitter_url, twitter_label)',
        parameters: {
          type: 'OBJECT',
          properties: {
            name:          { type: 'STRING', description: 'Display name' },
            intro:         { type: 'STRING', description: 'Intro text' },
            twitter_url:   { type: 'STRING', description: 'Twitter URL' },
            twitter_label: { type: 'STRING', description: 'Twitter link label' },
          },
        },
      },
    ],
  },
];

const executeTool = async (name, args) => {
  switch (name) {
    case 'list_projects': {
      const projects = args.status
        ? await projectModel.getProjectsByStatus(args.status)
        : await projectModel.getAllProjects();
      return { projects };
    }
    case 'get_project': {
      const project = await projectModel.getProjectById(args.id);
      return project ? { project } : { error: 'Project not found' };
    }
    case 'create_project': {
      const project = await projectModel.createProject(args);
      return { project };
    }
    case 'update_project': {
      const { id, ...updates } = args;
      const project = await projectModel.updateProject(id, updates);
      return { project };
    }
    case 'delete_project': {
      const deleted = await projectModel.deleteProject(args.id);
      return deleted ? { deleted: true, name: deleted.name } : { error: 'Project not found' };
    }
    case 'get_profile': {
      const profile = await profileModel.getProfile();
      return { profile };
    }
    case 'update_profile': {
      for (const [field, value] of Object.entries(args)) {
        await profileModel.updateSetting(field, value);
      }
      const profile = await profileModel.getProfile();
      return { profile };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
};

const handleGeminiMessage = async (chatId, text) => {
  const history = chatHistories.get(chatId) || [];

  history.push({ role: 'user', parts: [{ text }] });

  let response = await genai.models.generateContent({
    model: GEMINI_MODEL,
    contents: history,
    tools: geminiTools,
    systemInstruction: {
      parts: [{
        text: `You are a portfolio project manager assistant. You help manage portfolio projects and profile settings via a Telegram bot. 
Use the provided tools to read and write data. Be concise and friendly in responses. 
When creating or updating, confirm what was done. When listing, format nicely.
Valid project statuses: current, wip, in_review, completed, archived, cancelled.`,
      }],
    },
  });

  // Agentic loop: keep executing tool calls until the model produces a text response
  while (response.functionCalls && response.functionCalls.length > 0) {
    const toolResults = [];

    for (const call of response.functionCalls) {
      logger.info('Gemini tool call', { chatId, tool: call.name, args: call.args });
      const result = await executeTool(call.name, call.args || {});
      toolResults.push({
        functionResponse: {
          name: call.name,
          response: result,
        },
      });
    }

    // Append the model's function call turn + our tool responses
    history.push({ role: 'model', parts: response.functionCalls.map(c => ({ functionCall: c })) });
    history.push({ role: 'user', parts: toolResults });

    response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: history,
      tools: geminiTools,
      systemInstruction: {
        parts: [{
          text: `You are a portfolio project manager assistant. You help manage portfolio projects and profile settings via a Telegram bot. 
Use the provided tools to read and write data. Be concise and friendly in responses. 
When creating or updating, confirm what was done. When listing, format nicely.
Valid project statuses: current, wip, in_review, completed, archived, cancelled.`,
        }],
      },
    });
  }

  const replyText = response.text || 'Done.';

  history.push({ role: 'model', parts: [{ text: replyText }] });

  // Keep history bounded to last 20 turns to avoid token bloat
  if (history.length > 40) history.splice(0, history.length - 40);

  chatHistories.set(chatId, history);

  return replyText;
};

// Bot commands
const commands = [
  { command: 'start', description: 'Start the bot and see available commands' },
  { command: 'list', description: 'List all projects' },
  { command: 'add', description: 'Add a new project' },
  { command: 'edit', description: 'Edit an existing project' },
  { command: 'status', description: 'Change project status' },
  { command: 'delete', description: 'Delete a project' },
  { command: 'order', description: 'Set display order for a project' },
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
  const order = project.display_order != null ? project.display_order : '—';
  return `📱 *${project.name}*\n` +
         `📝 ${project.description}\n` +
         `🔗 [Link](${project.href})\n` +
         `🏷️ Tags: ${tags}\n` +
         `📊 Status: ${project.status}\n` +
         `🔢 Order: ${order}\n` +
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
/order - Set display order for a project
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

bot.onText(/\/order/, (msg) => {
  const chatId = msg.chat.id;
  logger.info('/order', { chatId, username: msg.from?.username });
  userStates.set(chatId, { action: 'order', step: 'select' });
  bot.sendMessage(chatId, '🔢 *Set display order*\n\nPlease enter the project ID:', { parse_mode: 'Markdown' });
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  logger.info('/profile', { chatId, username: msg.from?.username });
  
  try {
    const profile = await profileModel.getProfile();
    logger.info('/profile fetched successfully', { chatId });
    userStates.set(chatId, { action: 'profile', step: 'select' });
    
    const profileMessage = `👤 Current Profile Settings:\n\n` +
                          `Name: ${profile.name}\n` +
                          `Intro: ${profile.intro}\n` +
                          `Twitter URL: ${profile.twitter_url}\n` +
                          `Twitter Label: ${profile.twitter_label}\n\n` +
                          `What would you like to edit?`;
    
    const options = [
      ['name', 'intro'],
      ['twitter_url', 'twitter_label'],
      ['done']
    ];
    
    await bot.sendMessage(chatId, profileMessage, {
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

// Handle text messages (multi-step interactions or Gemini AI)
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // Skip commands
  
  const chatId = msg.chat.id;
  const state = userStates.get(chatId);

  // If mid-flow state exists, continue the step-by-step flow
  if (state) {
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
      } else if (state.action === 'order') {
        await handleOrderProject(chatId, msg.text, state);
      } else if (state.action === 'profile') {
        await handleProfileEdit(chatId, msg.text, state);
      }
    } catch (error) {
      logger.error('Error handling message', { chatId, action: state.action, step: state.step, message: error.message, stack: error.stack });
      bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
      userStates.delete(chatId);
    }
    return;
  }

  // No active state — route to Gemini
  if (!process.env.GEMINI_API_KEY) {
    bot.sendMessage(chatId, '⚠️ GEMINI_API_KEY is not configured.');
    return;
  }

  logger.info('Gemini message', { chatId, text: msg.text });
  try {
    await bot.sendChatAction(chatId, 'typing');
    const reply = await handleGeminiMessage(chatId, msg.text);
    await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown', disable_web_page_preview: true });
  } catch (error) {
    logger.error('Gemini error', { chatId, message: error.message, stack: error.stack });
    await bot.sendMessage(chatId, '❌ AI error. Please try again.');
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
      ['order', 'done']
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
    } else if (state.field === 'order') {
      const num = parseInt(text);
      if (isNaN(num)) {
        bot.sendMessage(chatId, '❌ Order must be a number. Please try again:');
        return;
      }
      updates.display_order = num;
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
      ['order', 'done']
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

// Order project handler
const handleOrderProject = async (chatId, text, state) => {
  if (state.step === 'select') {
    const projectId = parseInt(text);
    const project = await projectModel.getProjectById(projectId);
    
    if (!project) {
      bot.sendMessage(chatId, '❌ Project not found. Please try again with a valid ID.');
      return;
    }
    
    state.projectId = projectId;
    state.project = project;
    state.step = 'order';
    
    const currentOrder = project.display_order != null ? project.display_order : 'not set';
    bot.sendMessage(chatId, `🔢 *${project.name}*\nCurrent order: ${currentOrder}\n\nEnter the new display order (number):`, {
      parse_mode: 'Markdown'
    });
  } else if (state.step === 'order') {
    const num = parseInt(text);
    if (isNaN(num)) {
      bot.sendMessage(chatId, '❌ Order must be a number. Please try again:');
      return;
    }
    
    const updatedProject = await projectModel.updateProject(state.projectId, { display_order: num });
    bot.sendMessage(chatId, `✅ *Order updated!*\n\n${formatProject(updatedProject)}`, {
      parse_mode: 'Markdown'
    });
    
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