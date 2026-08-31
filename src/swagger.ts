import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
import mongooseToSwagger from 'mongoose-to-swagger';
import {Express} from 'express';
import Appointment from './models/appointment.model';
import Role from './models/role.model';
import User from './models/user.model';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Doctor's Appointment App Backend API",
            version: "1.0.0",
            description: "REST API for authentication, users, and doctor appointments."
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Local development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                User: mongooseToSwagger(User),
                Role: mongooseToSwagger(Role),
                Appointment: mongooseToSwagger(Appointment),
                SignupRequest: {
                    type: 'object',
                    required: ['username', 'password', 'email'],
                    properties: {
                        username: { type: 'string', example: 'jdoe' },
                        password: { type: 'string', format: 'password', minLength: 5 },
                        email: { type: 'string', format: 'email', example: 'jdoe@example.com' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'jdoe' },
                        password: { type: 'string', format: 'password' }
                    }
                },
                CreateUserRequest: {
                    type: 'object',
                    required: ['username', 'password', 'email'],
                    properties: {
                        username: { type: 'string' },
                        password: { type: 'string', format: 'password', minLength: 5 },
                        firstname: { type: 'string' },
                        lastname: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        address: { $ref: '#/components/schemas/Address' },
                        phone: { type: 'array', items: { $ref: '#/components/schemas/Phone' } },
                        roles: { type: 'array', items: { type: 'string' } }
                    }
                },
                UpdateUserRequest: {
                    type: 'object',
                    properties: {
                        password: { type: 'string', format: 'password', minLength: 5 },
                        firstname: { type: 'string' },
                        lastname: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        address: { $ref: '#/components/schemas/Address' },
                        phone: { type: 'array', items: { $ref: '#/components/schemas/Phone' } },
                        roles: { type: 'array', items: { type: 'string' } }
                    }
                },
                CreateAppointmentRequest: {
                    type: 'object',
                    required: ['date', 'slot'],
                    properties: {
                        date: { type: 'string', example: '2026-09-01' },
                        slot: { type: 'string', example: '09:00' },
                        specialty: { type: 'string', example: 'General Medicine' }
                    }
                },
                UpdateAppointmentRequest: {
                    type: 'object',
                    required: ['date', 'slot'],
                    properties: {
                        date: { type: 'string', example: '2026-09-01' },
                        slot: { type: 'string', example: '09:00' }
                    }
                },
                Address: {
                    type: 'object',
                    properties: {
                        area: { type: 'string' },
                        street: { type: 'string' },
                        number: { type: 'string' },
                        po: { type: 'string' }
                    }
                },
                Phone: {
                    type: 'object',
                    required: ['type', 'number'],
                    properties: {
                        type: { type: 'string' },
                        number: { type: 'string' }
                    }
                }
            }
        }
    },
      apis: ["./src/routes/*.ts"]

};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}