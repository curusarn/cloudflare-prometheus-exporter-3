import type { Account, MinimalZone, Zone } from "./types";

/**
 * Common zone interface for functions that only need id and name.
 */
type ZoneWithName = { id: string; name: string };

/**
 * Parses comma-separated string into Set, trimming whitespace.
 *
 * @param value Comma-separated string to parse.
 * @returns Set of trimmed non-empty strings, or empty Set for empty/undefined input.
 */
export function parseCommaSeparated(value: string | undefined): Set<string> {
	if (!value || value.trim() === "") {
		return new Set();
	}
	return new Set(
		value
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s.length > 0),
	);
}

/**
 * Filters accounts to only include those with IDs in the set.
 *
 * @param accounts Array of accounts to filter.
 * @param includeIds Set of account IDs to include.
 * @returns Filtered array of accounts.
 */
export function filterAccountsByIds(
	accounts: Account[],
	includeIds: ReadonlySet<string>,
): Account[] {
	return accounts.filter((a) => includeIds.has(a.id));
}

/**
 * Filters zones to only include those with IDs in the set.
 *
 * @param zones Array of zones to filter.
 * @param includeIds Set of zone IDs to include.
 * @returns Filtered array of zones.
 */
export function filterZonesByIds(
	zones: Zone[],
	includeIds: ReadonlySet<string>,
): Zone[] {
	return zones.filter((z) => includeIds.has(z.id));
}

/**
 * Looks up zone name by ID, falling back to ID if not found.
 * Works with both Zone and MinimalZone arrays.
 *
 * @param zoneId Zone ID to look up.
 * @param zones Array of zones to search.
 * @returns Zone name if found, otherwise the zone ID.
 */
export function findZoneName(zoneId: string, zones: ZoneWithName[]): string {
	return zones.find((z) => z.id === zoneId)?.name ?? zoneId;
}

/**
 * Plan ID for Cloudflare Free tier.
 * Free tier zones don't have access to GraphQL Analytics API.
 */
export const FREE_PLAN_ID = "0feeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

/**
 * Check if MinimalZone is on Free tier.
 *
 * @param zone MinimalZone to check.
 * @returns True if zone is on Free tier.
 */
export function isFreeTierMinimalZone(zone: MinimalZone): boolean {
	return zone.planId === FREE_PLAN_ID;
}

/**
 * Check if full Zone is on Free tier.
 *
 * @param zone Zone to check.
 * @returns True if zone is on Free tier.
 */
export function isFreeTierZone(zone: Zone): boolean {
	return zone.plan.id === FREE_PLAN_ID;
}

/**
 * Partition MinimalZones into paid and free tier.
 *
 * @param zones Array of MinimalZones to partition.
 * @returns Object with paid and free zone arrays.
 */
export function partitionZonesByTier(zones: MinimalZone[]): {
	paid: MinimalZone[];
	free: MinimalZone[];
} {
	const paid: MinimalZone[] = [];
	const free: MinimalZone[] = [];
	for (const zone of zones) {
		if (isFreeTierMinimalZone(zone)) {
			free.push(zone);
		} else {
			paid.push(zone);
		}
	}
	return { paid, free };
}
