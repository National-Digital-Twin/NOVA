/**
 * Data models for layer information
 */

/**
 * Attribute interface representing configurable properties of an item
 */
export interface Attribute {
  /**
   * Unique identifier for the attribute
   */
  id: string;
  
  /**
   * Human-readable description of the attribute
   */
  description: string;
  
  /**
   * Default value for the attribute
   */
  defaultValue: number | string;
  
  /**
   * Data type of the attribute value
   */
  valueType: string;
  
  /**
   * Optional list of available options for string attributes
   */
  options?: string[];
}

/**
 * Item interface representing a specific layer item
 */
export interface Item {

  /**
   * Unique identifier for the item
   */
  id: string;

  /**
   * Name of the item
   */
  name: string;
  
  /**
   * List of configurable attributes for this item
   */
  attributes: Attribute[];
}

/**
 * Category interface representing a group of related items
 */
export interface Category {
  /**
   * Name of the category
   */
  name: string;
  
  /**
   * List of items in this category
   */
  items: Item[];
}

/**
 * LayersDTO interface representing the complete layers data structure
 */
export interface LayersDTO {
  /**
   * List of categories containing layer items
   */
  categories: Category[];
}