// Restaurant detection logic based on product patterns

export interface RestaurantInfo {
  name: string;
  cuisineType: string;
  confidence: number; // 0-1, how confident we are about this detection
}

interface ProductPattern {
  patterns: string[];
  restaurant: RestaurantInfo;
}

// Define restaurant patterns based on common food items
const RESTAURANT_PATTERNS: ProductPattern[] = [
  {
    patterns: ['mcnuggets', 'big mac', 'quarter pounder', 'mcdouble', 'mcchicken', 'dr pepper®', 'coca-cola®'],
    restaurant: { name: "McDonald's", cuisineType: 'Fast Food', confidence: 0.95 }
  },
  {
    patterns: ['pad thai', 'thai fried rice', 'tom yum', 'green curry', 'massaman'],
    restaurant: { name: 'Thai Palace', cuisineType: 'Thai', confidence: 0.9 }
  },
  {
    patterns: ['burrito bowl', 'burrito', 'quesadilla', 'guacamole', 'carnitas', 'barbacoa'],
    restaurant: { name: 'Chipotle', cuisineType: 'Mexican', confidence: 0.9 }
  },
  {
    patterns: ['vanilla shake', 'chocolate shake', 'strawberry shake', 'shackburger'],
    restaurant: { name: 'Shake Shack', cuisineType: 'Fast Food', confidence: 0.85 }
  },
  {
    patterns: ['pizza', 'pepperoni', 'margherita', 'calzone', 'garlic bread'],
    restaurant: { name: 'Tony\'s Pizza', cuisineType: 'Italian', confidence: 0.8 }
  },
  {
    patterns: ['california roll', 'salmon roll', 'tuna', 'tempura', 'miso soup'],
    restaurant: { name: 'Sakura Sushi', cuisineType: 'Japanese', confidence: 0.85 }
  },
  {
    patterns: ['kung pao', 'sweet and sour', 'fried rice', 'lo mein', 'dim sum'],
    restaurant: { name: 'Golden Dragon', cuisineType: 'Chinese', confidence: 0.8 }
  }
];

// Fallback restaurants for when we can't detect a specific pattern
const FALLBACK_RESTAURANTS: RestaurantInfo[] = [
  { name: 'The Local Spot', cuisineType: 'American', confidence: 0.3 },
  { name: 'Corner Cafe', cuisineType: 'Cafe', confidence: 0.3 },
  { name: 'Downtown Bistro', cuisineType: 'Contemporary', confidence: 0.3 },
  { name: 'Neighborhood Kitchen', cuisineType: 'American', confidence: 0.3 },
  { name: 'Urban Eatery', cuisineType: 'Fusion', confidence: 0.3 }
];

export function detectRestaurant(products: Array<{ name: string }>): RestaurantInfo {
  const productNames = products.map(p => p.name.toLowerCase());
  const productText = productNames.join(' ');

  let bestMatch: RestaurantInfo | null = null;
  let bestScore = 0;

  // Check each restaurant pattern
  for (const pattern of RESTAURANT_PATTERNS) {
    let matchCount = 0;
    let totalPatterns = pattern.patterns.length;

    // Count how many patterns match
    for (const searchPattern of pattern.patterns) {
      if (productText.includes(searchPattern.toLowerCase())) {
        matchCount++;
      }
    }

    // Calculate score (percentage of patterns matched * confidence)
    const score = (matchCount / totalPatterns) * pattern.restaurant.confidence;

    if (score > bestScore && matchCount > 0) {
      bestScore = score;
      bestMatch = pattern.restaurant;
    }
  }

  // If we found a good match (score > 0.3), use it
  if (bestMatch && bestScore > 0.3) {
    return { ...bestMatch, confidence: bestScore };
  }

  // Otherwise, use a fallback restaurant
  const fallbackIndex = Math.abs(productText.length) % FALLBACK_RESTAURANTS.length;
  return FALLBACK_RESTAURANTS[fallbackIndex];
}

export function getRestaurantFromUrl(url: string): RestaurantInfo | null {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('doordash.com')) {
    // For DoorDash, we might be able to extract restaurant name from URL
    // For now, return null to use product-based detection
    return null;
  }

  if (urlLower.includes('ubereats.com')) {
    // For UberEats, we might be able to extract restaurant name from URL
    // For now, return null to use product-based detection
    return null;
  }

  return null;
}

// Generate a restaurant name based on cuisine type and a seed for consistency
export function generateRestaurantName(cuisineType: string, seed: string): string {
  const names = {
    'Fast Food': ['Quick Bites', 'Speedy Eats', 'Fast & Fresh', 'Rapid Kitchen'],
    'Thai': ['Thai Garden', 'Bangkok Kitchen', 'Spice Palace', 'Thai Orchid'],
    'Mexican': ['Casa Miguel', 'El Sabor', 'Aztec Kitchen', 'La Cocina'],
    'Italian': ['Bella Vista', 'Roma Kitchen', 'Little Italy', 'Nonna\'s Place'],
    'Chinese': ['Golden Wok', 'Dragon Palace', 'Jade Garden', 'Ming\'s Kitchen'],
    'Japanese': ['Sakura House', 'Tokyo Bay', 'Zen Garden', 'Sushi Express'],
    'American': ['All-American Diner', 'Liberty Kitchen', 'Stars & Stripes', 'Main Street Grill'],
    'Contemporary': ['Modern Table', 'The Kitchen', 'Fresh Fork', 'Urban Plate'],
    'Cafe': ['Coffee Corner', 'Brew & Bite', 'Morning Glory', 'The Daily Grind'],
    'Fusion': ['Mix & Match', 'Fusion Table', 'WorldWide Kitchen', 'Global Bites']
  };

  const options = names[cuisineType as keyof typeof names] || names['American'];
  const index = Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % options.length;
  return options[index];
}