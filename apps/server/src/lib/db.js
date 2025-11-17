import { prisma } from '../index.js';

/**
 * Database helper functions using Prisma
 * Legacy db module for backward compatibility
 */

export const db = {
  /**
   * Get projects with pagination
   */
  async getProjects(limit = 20) {
    try {
      const projects = await prisma.project.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  username: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              members: true,
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      return projects;
    } catch (error) {
      console.error('[DB_GET_PROJECTS]', error);
      throw error;
    }
  },

  /**
   * Create a new project
   */
  async createProject(name, summary, ownerId, description, coverImage, tags, teamSize, lookingFor, category, status) {
    try {
      const project = await prisma.project.create({
        data: {
          name,
          summary: summary || null,
          description: description || null,
          coverImage: coverImage || null,
          tags: tags || null,
          category: category || 'other',
          status: status || 'recruiting',
          teamSize: teamSize || 1,
          lookingFor: lookingFor || null,
          ownerId
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      return project;
    } catch (error) {
      console.error('[DB_CREATE_PROJECT]', error);
      throw error;
    }
  },

  /**
   * Join a project
   */
  async joinProject(projectId, userId) {
    try {
      // Check if already a member
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId
          }
        }
      });

      if (existingMember) {
        throw new Error('Already a member of this project');
      }

      // Check if user is the owner
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (project.ownerId === userId) {
        throw new Error('You are the owner of this project');
      }

      // Add member
      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          joinedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          }
        }
      });

      return { success: true, member };
    } catch (error) {
      console.error('[DB_JOIN_PROJECT]', error);
      throw error;
    }
  },

  /**
   * Leave a project
   */
  async leaveProject(projectId, userId) {
    try {
      await prisma.projectMember.delete({
        where: {
          projectId_userId: {
            projectId,
            userId
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('[DB_LEAVE_PROJECT]', error);
      throw error;
    }
  },

  /**
   * Get project members
   */
  async getProjectMembers(projectId) {
    try {
      const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          joinedAt: 'asc'
        }
      });

      return members;
    } catch (error) {
      console.error('[DB_GET_PROJECT_MEMBERS]', error);
      throw error;
    }
  },

  /**
   * Send a project message
   */
  async sendProjectMessage(projectId, senderId, content) {
    try {
      const message = await prisma.projectMessage.create({
        data: {
          projectId,
          senderId,
          content
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          }
        }
      });

      return message;
    } catch (error) {
      console.error('[DB_SEND_PROJECT_MESSAGE]', error);
      throw error;
    }
  },

  /**
   * Get project messages
   */
  async getProjectMessages(projectId, limit = 50) {
    try {
      const messages = await prisma.projectMessage.findMany({
        where: { projectId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: limit
      });

      return messages;
    } catch (error) {
      console.error('[DB_GET_PROJECT_MESSAGES]', error);
      throw error;
    }
  },

  /**
   * Update project status
   */
  async updateProjectStatus(projectId, status) {
    try {
      const project = await prisma.project.update({
        where: { id: projectId },
        data: { status },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true
            }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('[DB_UPDATE_PROJECT_STATUS]', error);
      throw error;
    }
  },

  /**
   * Get admin statistics
   */
  async stats() {
    try {
      const [
        userCount,
        postCount,
        threadCount,
        projectCount,
        materialCount
      ] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.thread.count(),
        prisma.project.count(),
        prisma.material.count()
      ]);

      return {
        users: userCount,
        posts: postCount,
        threads: threadCount,
        projects: projectCount,
        materials: materialCount
      };
    } catch (error) {
      console.error('[DB_STATS]', error);
      throw error;
    }
  }
};
