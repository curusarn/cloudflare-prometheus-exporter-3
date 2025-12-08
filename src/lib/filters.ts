import type { Account, Zone } from "./types";

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
 *
 * @param zoneId Zone ID to look up.
 * @param zones Array of zones to search.
 * @returns Zone name if found, otherwise the zone ID.
 */
export function findZoneName(zoneId: string, zones: Zone[]): string {
	return zones.find((z) => z.id === zoneId)?.name ?? zoneId;
}
