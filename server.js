import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import { DataSource, MapProject } from './lib/models.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const defaultDataSources = [];
const dataSources = new Map();
const projects = new Map(); // Map to store active projects

// Function to load all projects from MongoDB
const loadProjects = async () => {
    try {
        const dbProjects = await MapProject.find({});
        dbProjects.forEach(project => {
            projects.set(project._id.toString(), {
                id: project._id.toString(),
                name: project.name,
                description: project.description,
                initialViewState: project.initialViewState,
                geojsonData: project.geojsonData,
                lastModified: project.lastModified,
                createdAt: project.createdAt
            });
        });
        console.log(`Loaded ${dbProjects.length} map projects from MongoDB`);
    } catch (error) {
        console.error('Error loading map projects from MongoDB:', error);
    }
};

const loadDataSources = async () => {
    try {
        const dbSources = await DataSource.find({});
        dbSources.forEach(source => {
            dataSources.set(source.id, {
                id: source.id,
                url: source.url,
                name: source.name,
                projectId: source.projectId ? source.projectId.toString() : null,
                theme: source.theme
            });
        });
        console.log(`Loaded ${dbSources.length} data sources from MongoDB`);
    } catch (error) {
        console.error('Error loading data sources from MongoDB:', error);
    }
};

const fetchDataFromSource = async (source) => {
    try {
        console.log(`Fetching data from ${source.url}`);
        const response = await fetch(source.url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching from ${source.id} (${source.url}):`, error);
        return { error: `Failed to fetch data from ${source.name}` };
    }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/astrikos', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
});

const db = mongoose.connection;
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', async () => {
    console.log('MongoDB connected successfully');
    // Load projects and data sources after connection is established
    await loadProjects();
    await loadDataSources();
});

io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Send available projects and data sources to the client
    socket.emit('available-projects', Array.from(projects.values()));
    socket.emit('available-sources', Array.from(dataSources.values()));

    const activeIntervals = new Map();
    let activeProjectId = null;

    // Project-related events
    socket.on('create-project', async (projectData) => {
        try {
            if (!projectData.name) {
                socket.emit('error', { message: 'Project name is required' });
                return;
            }

            const newProject = new MapProject({
                name: projectData.name,
                description: projectData.description || '',
                initialViewState: projectData.initialViewState || {
                    longitude: 77.216721,
                    latitude: 28.6448,
                    zoom: 4
                },
                geojsonData: projectData.geojsonData || null,
            });

            await newProject.save();
            const projectId = newProject._id.toString();

            // Update local cache
            projects.set(projectId, {
                id: projectId,
                name: newProject.name,
                description: newProject.description,
                initialViewState: newProject.initialViewState,
                geojsonData: newProject.geojsonData,
                lastModified: newProject.lastModified,
                createdAt: newProject.createdAt
            });

            // Notify all clients about the new project
            io.emit('available-projects', Array.from(projects.values()));
            socket.emit('project-created', projects.get(projectId));
            console.log(`New project created: ${newProject.name} (${projectId})`);
        } catch (error) {
            console.error('Error creating project:', error);
            socket.emit('error', { message: 'Failed to create project' });
        }
    });

    socket.on('get-project', async ({ projectId }) => {
        try {
            if (!projectId || !projects.has(projectId)) {
                socket.emit('error', { message: 'Invalid or non-existent project ID' });
                return;
            }

            const project = projects.get(projectId);

            // Set this as the active project for this socket
            activeProjectId = projectId;

            // Get all data sources for this project
            const projectSources = Array.from(dataSources.values())
                .filter(source => source.projectId === projectId);

            socket.emit('project-data', { project, dataSources: projectSources });
            console.log(`Client loaded project: ${project.name} (${projectId})`);
        } catch (error) {
            console.error(`Error getting project ${projectId}:`, error);
            socket.emit('error', { message: 'Failed to load project' });
        }
    });

    socket.on('update-project', async ({ projectId, projectData }) => {
        try {
            if (!projectId || !projects.has(projectId)) {
                socket.emit('error', { message: 'Invalid or non-existent project ID' });
                return;
            }

            // Update in MongoDB
            const updatedProject = await MapProject.findByIdAndUpdate(
                projectId,
                {
                    ...projectData,
                    lastModified: new Date()
                },
                { new: true }
            );

            if (!updatedProject) {
                socket.emit('error', { message: 'Project not found in database' });
                return;
            }

            // Update local cache
            projects.set(projectId, {
                id: projectId,
                name: updatedProject.name,
                description: updatedProject.description,
                initialViewState: updatedProject.initialViewState,
                geojsonData: updatedProject.geojsonData,
                lastModified: updatedProject.lastModified,
                createdAt: updatedProject.createdAt
            });

            // Notify all clients about the update
            io.emit('available-projects', Array.from(projects.values()));
            socket.emit('project-updated', projects.get(projectId));
            console.log(`Project updated: ${updatedProject.name} (${projectId})`);
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            socket.emit('error', { message: 'Failed to update project' });
        }
    });

    socket.on('delete-project', async ({ projectId }) => {
        try {
            if (!projectId || !projects.has(projectId)) {
                socket.emit('error', { message: 'Invalid or non-existent project ID' });
                return;
            }

            const projectName = projects.get(projectId).name;

            // Delete from MongoDB
            await MapProject.findByIdAndDelete(projectId);

            // Delete all associated data sources
            const projectSourceIds = Array.from(dataSources.values())
                .filter(source => source.projectId === projectId)
                .map(source => source.id);

            // Use string comparison instead of converting to ObjectId
            await DataSource.deleteMany({ projectId: projectId });

            // Update local caches
            projects.delete(projectId);
            projectSourceIds.forEach(sourceId => {
                dataSources.delete(sourceId);
            });

            // Notify all clients
            io.emit('available-projects', Array.from(projects.values()));
            io.emit('available-sources', Array.from(dataSources.values()));
            socket.emit('project-deleted', { id: projectId });
            console.log(`Project deleted: ${projectName} (${projectId})`);

            // Clear active project if it was the deleted one
            if (activeProjectId === projectId) {
                activeProjectId = null;
            }
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            socket.emit('error', { message: 'Failed to delete project' });
        }
    });

    // Data Source Events - Updated for project association
    socket.on('subscribe-source', async ({ sourceId }) => {
        if (activeIntervals.has(sourceId)) {
            console.log(`Client already subscribed to source: ${sourceId}`);
            return;
        }

        const source = dataSources.get(sourceId);
        if (!source) {
            socket.emit('error', { message: `Source with ID ${sourceId} not found` });
            return;
        }

        console.log(`Client subscribed to source: ${sourceId}`);

        const interval = setInterval(async () => {
            try {
                const data = await fetchDataFromSource(source);

                socket.emit('realtime-data', {
                    sourceId,
                    data,
                    sourceName: source.name
                });
            } catch (error) {
                console.error(`Error in interval for ${sourceId}:`, error);
            }
        }, 10);

        activeIntervals.set(sourceId, interval);
    });

    socket.on('unsubscribe-source', ({ sourceId }) => {
        if (activeIntervals.has(sourceId)) {
            const interval = activeIntervals.get(sourceId);
            clearInterval(interval);
            activeIntervals.delete(sourceId);
            console.log(`Client unsubscribed from source: ${sourceId}`);
        }
    });

    socket.on('add-source', async ({ id, url, name, projectId }) => {
        if (!id || !url || !name) {
            socket.emit('error', { message: 'Missing required fields for data source' });
            return;
        }

        // If a projectId is provided, verify it exists
        if (projectId && !projects.has(projectId)) {
            socket.emit('error', { message: 'Invalid project ID' });
            return;
        }

        // Use active project if no projectId provided
        const finalProjectId = projectId || activeProjectId;

        let themeColor = '#60a5fa';
        let bgColor = '#1e3a8a';

        if (id.includes('traffic')) {
            themeColor = '#10b981';
            bgColor = '#064e3b';
        } else if (id.includes('weather')) {
            themeColor = '#a855f7';
            bgColor = '#4c1d95';
        } else if (id.includes('bus')) {
            themeColor = '#f97316';
            bgColor = '#7c2d12';
        }

        const newSource = {
            id,
            url,
            name,
            projectId: finalProjectId,
            theme: {
                color: themeColor,
                backgroundColor: bgColor
            }
        };

        try {
            // Create or update the data source in MongoDB
            await DataSource.findOneAndUpdate(
                { id: id },
                newSource,
                { upsert: true, new: true }
            );

            // Update the local cache
            dataSources.set(id, newSource);
            io.emit('available-sources', Array.from(dataSources.values()));
            console.log(`New data source added to MongoDB: ${name} (${id}) - ${url}`);
        } catch (error) {
            console.error('Error adding data source to MongoDB:', error);
            socket.emit('error', { message: 'Failed to save data source to database' });
        }
    });

    socket.on('delete-source', async ({ sourceId }) => {
        if (dataSources.has(sourceId)) {
            try {
                // Delete from MongoDB
                await DataSource.deleteOne({ id: sourceId });

                // Update local cache
                const sourceName = dataSources.get(sourceId).name;
                dataSources.delete(sourceId);
                io.emit('available-sources', Array.from(dataSources.values()));
                console.log(`Data source deleted from MongoDB: ${sourceName} (${sourceId})`);
            } catch (error) {
                console.error('Error deleting data source from MongoDB:', error);
                socket.emit('error', { message: 'Failed to delete data source from database' });
            }
        } else {
            socket.emit('error', { message: `Source with ID ${sourceId} not found` });
        }
    });

    socket.on('disconnect', () => {
        for (const interval of activeIntervals.values()) {
            clearInterval(interval);
        }
        activeIntervals.clear();
        console.log(`Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
    console.log(`Using dark theme for UI`);
});

export { io };
