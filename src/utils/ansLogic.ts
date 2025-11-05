import type { Symbol, StateInfo } from '../types';

/**
 * Generate the repeating pattern of symbols based on their frequencies.
 * For example: A-2, B-1, C-1 produces [A, A, B, C, A, A, B, C, ...]
 */
export function generateStatePattern(symbols: Symbol[], maxStates: number = 1000): StateInfo[] {
  if (symbols.length === 0) return [];
  
  // Create the base pattern by repeating each symbol according to its frequency
  const basePattern: Symbol[] = [];
  symbols.forEach(symbol => {
    for (let i = 0; i < symbol.frequency; i++) {
      basePattern.push(symbol);
    }
  });
  
  // Generate states by repeating the base pattern
  const states: StateInfo[] = [];
  for (let i = 0; i < maxStates; i++) {
    const patternIndex = i % basePattern.length;
    states.push({
      index: i,
      symbol: basePattern[patternIndex]
    });
  }
  
  return states;
}

/**
 * Calculate L (sum of all frequencies)
 */
export function calculateL(symbols: Symbol[]): number {
  return symbols.reduce((sum, symbol) => sum + symbol.frequency, 0);
}

/**
 * Calculate the chain of previous states from state n back to state 0.
 * Uses the formula: prevState = (n // L) * f_{s(n)} + (n mod L) - C_{s(n)}
 * where:
 * - n // L is integer division
 * - n mod L is the remainder
 * - s(n) is the symbol at state n
 * - f_s is the frequency of symbol s
 * - C_s is the cumulative sum of frequencies up to (not including) symbol s
 */
export function calculateEdgeChain(n: number, symbols: Symbol[], numLeadingAs: number): number[] {
  if (symbols.length === 0 || n < 0) return [];

  const L = calculateL(symbols);
  
  // Build cumulative sum map: symbol name -> cumulative sum
  const cumulativeMap = new Map<string, number>();
  let cumSum = 0;
  symbols.forEach(symbol => {
    cumulativeMap.set(symbol.name, cumSum);
    cumSum += symbol.frequency;
  });
  
  // Build frequency map: symbol name -> frequency
  const frequencyMap = new Map<string, number>();
  symbols.forEach(symbol => {
    frequencyMap.set(symbol.name, symbol.frequency);
  });

  const symbolMap = new Map<number, Symbol>();
  let ii = 0;
  for (let i = 0; i < symbols.length; i++) {
    for (let j = 0; j < symbols[i].frequency; j++) {
      symbolMap.set(ii, symbols[i]);
      ii++;
    }
  }
  if (ii !== L) {
    throw new Error("Symbol map construction error");
  }
  
  const chain: number[] = [];
  let current = n;
  
  // Iterate backwards until we reach initial states
  while (true) {
    if (current < (frequencyMap.get(symbols[0].name) || 1)) {
      for (let i = 0; i < numLeadingAs; i++) {
        chain.push(current);
      }
      break;
    }
    else {
      chain.push(current);
    }

    const currentModL = current % L;
    const currentSymbol = symbolMap.get(currentModL);
    if (!currentSymbol) {
      throw new Error("Invalid state encountered in edge chain calculation");
    }
    const symbolName = currentSymbol.name;
    const f_s = frequencyMap.get(symbolName) || 0;
    const C_s = cumulativeMap.get(symbolName) || 0;
    
    // Calculate prevState using the formula
    const prevState = Math.floor(current / L) * f_s + (current % L) - C_s;
    
    current = prevState;
  }
  
  return chain;
}

/**
 * Calculate the forward edges from state n for each symbol.
 * Uses the formula: nextState(n, s) = (n // f_s)*L + C_s + (n mod f_s)
 * where:
 * - n // f_s is integer division
 * - f_s is the frequency of symbol s
 * - C_s is the cumulative sum of frequencies up to (not including) symbol s
 * - L is the sum of all frequencies
 */
export function calculateForwardEdges(n: number, symbols: Symbol[], maxStates: number): Array<{ toState: number; symbol: Symbol }> {
  if (symbols.length === 0 || n < 0) return [];
  
  const L = calculateL(symbols);
  
  // Build cumulative sum map: symbol name -> cumulative sum
  const cumulativeMap = new Map<string, number>();
  let cumSum = 0;
  symbols.forEach(symbol => {
    cumulativeMap.set(symbol.name, cumSum);
    cumSum += symbol.frequency;
  });
  
  const forwardEdges: Array<{ toState: number; symbol: Symbol }> = [];
  
  symbols.forEach(symbol => {
    const f_s = symbol.frequency;
    const C_s = cumulativeMap.get(symbol.name) || 0;
    
    // Calculate nextState using the formula
    const nextState = Math.floor(n / f_s) * L + C_s + (n % f_s);
    
    // Only add if the next state is within bounds
    if (nextState >= 0 && nextState < maxStates) {
      forwardEdges.push({ toState: nextState, symbol });
    }
  });
  
  return forwardEdges;
}

/**
 * Get default color palette - softer, more appealing colors
 */
export function getDefaultColors(): string[] {
  return [
    '#64B5F6', // light blue
    '#F06292', // light pink
    '#BA68C8', // light purple
    '#FFB74D', // light orange
    '#81C784', // light green
    '#E57373', // light red
    '#4DD0E1', // light cyan
    '#9575CD', // medium purple
    '#FF8A65', // coral
    '#A1887F', // light brown
  ];
}
