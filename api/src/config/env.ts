/**
 * Environment configuration class
 */
export class EnvConfig {

  // Server configuration
  public readonly port: number;

  /**
   * Constructor for EnvConfig
   */
  constructor() {

    // Server configuration
    this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  }
}

// Export a singleton instance
export const envConfig = new EnvConfig();