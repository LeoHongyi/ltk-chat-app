import { onRequestOptions as __api_agent_js_onRequestOptions } from "/Users/leo/ltk-chat-app/functions/api/agent.js"
import { onRequestPost as __api_agent_js_onRequestPost } from "/Users/leo/ltk-chat-app/functions/api/agent.js"
import { onRequestPost as __api_graphql_js_onRequestPost } from "/Users/leo/ltk-chat-app/functions/api/graphql.js"
import { onRequestOptions as __api_story_workshop_js_onRequestOptions } from "/Users/leo/ltk-chat-app/functions/api/story-workshop.js"
import { onRequestPost as __api_story_workshop_js_onRequestPost } from "/Users/leo/ltk-chat-app/functions/api/story-workshop.js"
import { onRequestGet as __api_user_js_onRequestGet } from "/Users/leo/ltk-chat-app/functions/api/user.js"
import { onRequestPost as __api_user_js_onRequestPost } from "/Users/leo/ltk-chat-app/functions/api/user.js"

export const routes = [
    {
      routePath: "/api/agent",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_agent_js_onRequestOptions],
    },
  {
      routePath: "/api/agent",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_agent_js_onRequestPost],
    },
  {
      routePath: "/api/graphql",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_graphql_js_onRequestPost],
    },
  {
      routePath: "/api/story-workshop",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_story_workshop_js_onRequestOptions],
    },
  {
      routePath: "/api/story-workshop",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_story_workshop_js_onRequestPost],
    },
  {
      routePath: "/api/user",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_user_js_onRequestGet],
    },
  {
      routePath: "/api/user",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_user_js_onRequestPost],
    },
  ]