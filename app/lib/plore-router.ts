// Plore v1 - Smart Model Router
// Routes queries to the best model based on task type

export type TaskType = 'code' | 'creative' | 'analysis' | 'general' | 'math';

export interface ModelRoute {
  model: string;
  reason: string;
}

// Model preferences for different task types
const MODEL_ROUTING = {
  code: 'openai/gpt-3.5-turbo',
  creative: 'anthropic/claude-3-sonnet',
  analysis: 'openai/gpt-4-turbo',
  math: 'anthropic/claude-3-opus',
  general: 'openai/gpt-3.5-turbo',
};

// Keywords and patterns for task detection
const TASK_PATTERNS = {
  code: [
    /\b(code|function|class|variable|debug|error|bug|implement|algorithm|programming)\b/i,
    /\b(javascript|python|java|typescript|react|vue|css|html|sql)\b/i,
    /```/,
    /\bapi\b/i,
  ],
  creative: [
    /\b(write|story|poem|creative|imagine|describe|narrative|character)\b/i,
    /\b(blog|article|content|copy|marketing)\b/i,
  ],
  analysis: [
    /\b(analyze|explain|compare|evaluate|assess|review|why|how does)\b/i,
    /\b(data|statistics|trends|insights)\b/i,
  ],
  math: [
    /\b(calculate|equation|formula|solve|mathematics|algebra|geometry)\b/i,
    /[0-9]+\s*[\+\-\*\/\=]/,
  ],
};

/**
 * Detects the type of task based on user input
 */
export function detectTaskType(input: string): TaskType {
  const lowerInput = input.toLowerCase();
  
  // Check each task type
  for (const [taskType, patterns] of Object.entries(TASK_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerInput)) {
        return taskType as TaskType;
      }
    }
  }
  
  return 'general';
}

/**
 * Routes to the best model for the given task
 */
export function routeToModel(input: string): ModelRoute {
  const taskType = detectTaskType(input);
  const model = MODEL_ROUTING[taskType];
  
  const reasons: Record<TaskType, string> = {
    code: 'Detected code-related query, using GPT-3.5 Turbo for fast code generation',
    creative: 'Detected creative writing, using Claude 3 Sonnet for nuanced content',
    analysis: 'Detected analytical query, using GPT-4 Turbo for deep reasoning',
    math: 'Detected mathematical problem, using Claude 3 Opus for precision',
    general: 'Using GPT-3.5 Turbo for general conversation',
  };
  
  return {
    model,
    reason: reasons[taskType],
  };
}

/**
 * Main Plore v1 function - returns the model to use
 */
export function getPloreModel(userInput: string): string {
  const route = routeToModel(userInput);
  console.log(`[Plore v1] ${route.reason}`);
  return route.model;
}