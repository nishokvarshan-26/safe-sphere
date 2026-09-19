export const trackedProtocols = [
  ["Aave", "aave"], ["Lido", "lido"], ["Maker", "makerdao"], ["Uniswap", "uniswap"],
  ["EigenLayer", "eigenlayer"], ["Spark", "spark"], ["Ethena", "ethena"], ["Curve", "curve-dex"],
  ["Compound", "compound-finance"], ["Morpho", "morpho"], ["Pendle", "pendle"], ["Convex", "convex-finance"],
  ["Rocket Pool", "rocket-pool"], ["Sky", "sky-lending"], ["Euler", "euler-v2"], ["Gearbox", "gearbox"],
  ["Venus", "venus-core-pool"], ["Moonwell", "moonwell"], ["Silo", "silo-finance"], ["Dolomite", "dolomite"],
  ["Radiant", "radiant-v2"], ["Balancer", "balancer-v2"], ["Frax", "frax"], ["Sushi", "sushiswap"],
  ["Liquity", "liquity"], ["dYdX", "dydx"], ["GMX", "gmx"], ["Stargate", "stargate"],
  ["Across", "across"], ["Aerodrome", "aerodrome"], ["PancakeSwap", "pancakeswap"], ["Kamino", "kamino-lend"]
] as const;

export const trackedSlugs = new Set(trackedProtocols.map(([, slug]) => slug));
