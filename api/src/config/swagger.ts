import swaggerJsdoc from "swagger-jsdoc";
import { Application } from "express";
import swaggerUi from "swagger-ui-express";

/**
 * Swagger configuration class
 */
export class SwaggerConfig {
  private readonly options: swaggerJsdoc.Options;

  /**
   * Constructor for SwaggerConfig
   * @param apiPath - Path to the API documentation
   */
  constructor(private readonly apiPath: string = "/api/docs") {
    this.options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "NOVA API",
          version: "1.0.0",
          description:
            "API for determining user details and access rights based on inbound JWT tokens.",
        },
        components: {
          schemas: {
            PositionDTO: {
              type: "object",
              properties: {
                latitude: {
                  type: "number",
                  description: "Latitude coordinate"
                },
                longitude: {
                  type: "number",
                  description: "Longitude coordinate"
                }
              },
              required: ["latitude", "longitude"]
            },
            Attribute: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Unique identifier for the attribute"
                },
                description: {
                  type: "string",
                  description: "Human-readable description of the attribute"
                },
                defaultValue: {
                  oneOf: [
                    { type: "number" },
                    { type: "string" }
                  ],
                  description: "Default value for the attribute"
                },
                valueType: {
                  type: "string",
                  description: "Data type of the attribute value"
                },
                options: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Optional list of available options for string attributes"
                }
              },
              required: ["id", "description", "defaultValue", "valueType"]
            },
            Item: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "id of the item"
                },
                name: {
                  type: "string",
                  description: "Name of the item"
                },
                attributes: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Attribute"
                  },
                  description: "List of configurable attributes for this item"
                }
              },
              required: ["name", "attributes"]
            },
            Category: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the category"
                },
                items: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Item"
                  },
                  description: "List of items in this category"
                }
              },
              required: ["name", "items"]
            },
            LayersDTO: {
              type: "object",
              properties: {
                categories: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Category"
                  },
                  description: "List of categories containing layer items"
                }
              },
              required: ["categories"]
            },
            GeoJSON: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description: "Type of GeoJSON object"
                },
                properties: {
                  type: "object",
                  description: "Properties of the GeoJSON object"
                },
                geometry: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      description: "Type of geometry"
                    },
                    coordinates: {
                      type: "array",
                      description: "Coordinates of the geometry"
                    }
                  },
                  description: "Geometry of the GeoJSON object"
                },
                features: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/GeoJSON"
                  },
                  description: "Features of the GeoJSON object (for FeatureCollection)"
                },
                bbox: {
                  type: "array",
                  items: {
                    type: "number"
                  },
                  description: "Bounding box of the GeoJSON object. For 2D coordinates: [west, south, east, north]. For 3D coordinates: [west, south, min_elevation, east, north, max_elevation]"
                }
              },
              required: ["type"]
            }
          }
        },
      },
      apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/models/*.ts"], // Look for Swagger comments in routes, controllers, and models
    };
  }

  /**
   * Configure Swagger for the Express application
   * @param app - Express application
   */
  public setup(app: Application): void {
    const swaggerSpec = swaggerJsdoc(this.options);
    app.use(this.apiPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger documentation available at ${this.apiPath}`);
  }
}
