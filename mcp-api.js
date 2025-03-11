const express = require('express');
const app = express();
app.use(express.json());

// In-memory storage for demonstration
let users = [];

// MCP Tool Definitions
const userTools = {
  createUser: {
    name: "createUser",
    description: "Creates a new user in the system",
    parameters: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Username for the new user"
        },
        email: {
          type: "string",
          description: "Email address for the new user"
        },
        age: {
          type: "number",
          description: "Age of the user"
        }
      },
      required: ["username", "email"]
    },
    function: async (params) => {
      const newUser = {
        id: Date.now().toString(),
        ...params,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      return newUser;
    }
  },

  findUsers: {
    name: "findUsers",
    description: "Search for users with various filters",
    parameters: {
      type: "object",
      properties: {
        age: {
          type: "number",
          description: "Filter users by age"
        },
        username: {
          type: "string",
          description: "Filter users by username (partial match)"
        },
        email: {
          type: "string",
          description: "Filter users by email"
        }
      }
    },
    function: async (params) => {
      let filteredUsers = [...users];
      
      if (params.age) {
        filteredUsers = filteredUsers.filter(user => user.age === params.age);
      }
      if (params.username) {
        filteredUsers = filteredUsers.filter(user => 
          user.username.toLowerCase().includes(params.username.toLowerCase())
        );
      }
      if (params.email) {
        filteredUsers = filteredUsers.filter(user => 
          user.email.toLowerCase().includes(params.email.toLowerCase())
        );
      }
      
      return filteredUsers;
    }
  },

  updateUser: {
    name: "updateUser",
    description: "Update an existing user's information",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the user to update"
        },
        username: {
          type: "string",
          description: "New username"
        },
        email: {
          type: "string",
          description: "New email address"
        },
        age: {
          type: "number",
          description: "New age"
        }
      },
      required: ["id"]
    },
    function: async (params) => {
      const userIndex = users.findIndex(u => u.id === params.id);
      if (userIndex === -1) throw new Error("User not found");
      
      users[userIndex] = {
        ...users[userIndex],
        ...params,
        id: users[userIndex].id // Prevent ID modification
      };
      
      return users[userIndex];
    }
  },

  deleteUser: {
    name: "deleteUser",
    description: "Remove a user from the system",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the user to delete"
        }
      },
      required: ["id"]
    },
    function: async (params) => {
      const userExists = users.some(u => u.id === params.id);
      if (!userExists) throw new Error("User not found");
      
      users = users.filter(u => u.id !== params.id);
      return { success: true };
    }
  }
};

// MCP endpoint that handles all user operations
app.post('/mcp', async (req, res) => {
  const { tool, parameters } = req.body;
  
  try {
    if (!userTools[tool]) {
      return res.status(400).json({
        error: "Unknown tool",
        availableTools: Object.keys(userTools)
      });
    }

    const result = await userTools[tool].function(parameters);
    res.json({
      success: true,
      data: result,
      tool: {
        name: tool,
        description: userTools[tool].description,
        parameters: userTools[tool].parameters
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      tool: {
        name: tool,
        description: userTools[tool].description,
        parameters: userTools[tool].parameters
      }
    });
  }
});

// Capability discovery endpoint
app.get('/mcp/capabilities', (req, res) => {
  res.json({
    version: "1.0",
    capabilities: Object.entries(userTools).map(([name, tool]) => ({
      name,
      description: tool.description,
      parameters: tool.parameters
    }))
  });
});

app.listen(3001, () => console.log('MCP API running on port 3001')); 