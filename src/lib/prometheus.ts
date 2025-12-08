import type { MetricDefinition } from "./metrics";

/**
 * Options for Prometheus serialization.
 */
export type SerializeOptions = {
	/** Set of metric names to exclude from output. */
	denylist?: ReadonlySet<string>;
	/** Set of label keys to exclude from all metrics. */
	excludeLabels?: ReadonlySet<string>;
};

/**
 * Serializes MetricDefinition array to Prometheus text exposition format.
 * Groups metrics by name, outputs HELP/TYPE headers, then values.
 *
 * @param metrics Array of metric definitions to serialize.
 * @param options Serialization options for filtering.
 * @returns Prometheus-formatted metrics string.
 */
export function serializeToPrometheus(
	metrics: readonly MetricDefinition[],
	options?: SerializeOptions,
): string {
	const denylist = options?.denylist ?? new Set<string>();
	const excludeLabels = options?.excludeLabels ?? new Set<string>();

	// Group metrics by name to consolidate HELP/TYPE headers
	const grouped = new Map<string, MetricDefinition>();

	for (const metric of metrics) {
		// Skip denied metrics
		if (denylist.has(metric.name)) {
			continue;
		}

		// Filter excluded labels from all values
		const filteredValues =
			excludeLabels.size > 0
				? metric.values.map((v) => ({
						...v,
						labels: filterLabels(v.labels, excludeLabels),
					}))
				: metric.values;

		const existing = grouped.get(metric.name);
		if (existing) {
			// Merge values
			grouped.set(metric.name, {
				...existing,
				values: [...existing.values, ...filteredValues],
			});
		} else {
			grouped.set(metric.name, { ...metric, values: [...filteredValues] });
		}
	}

	const lines: string[] = [];

	for (const [name, metric] of grouped) {
		// HELP line
		lines.push(`# HELP ${name} ${escapeHelp(metric.help)}`);
		// TYPE line
		lines.push(`# TYPE ${name} ${metric.type}`);

		// Value lines
		for (const { labels, value } of metric.values) {
			const labelStr = formatLabels(labels);
			lines.push(`${name}${labelStr} ${formatValue(value)}`);
		}

		// Blank line between metrics for readability
		lines.push("");
	}

	return lines.join("\n");
}

/**
 * Filters out excluded label keys from a labels object.
 *
 * @param labels Original label key-value pairs.
 * @param exclude Set of label keys to exclude.
 * @returns Filtered labels object.
 */
function filterLabels(
	labels: Record<string, string>,
	exclude: ReadonlySet<string>,
): Record<string, string> {
	const filtered: Record<string, string> = {};
	for (const [key, value] of Object.entries(labels)) {
		if (!exclude.has(key)) {
			filtered[key] = value;
		}
	}
	return filtered;
}

/**
 * Formats labels object into Prometheus label string.
 *
 * @param labels Label key-value pairs.
 * @returns Formatted label string like `{key="value"}` or empty string.
 */
function formatLabels(labels: Record<string, string>): string {
	const entries = Object.entries(labels);
	if (entries.length === 0) return "";

	const formatted = entries
		.map(([key, value]) => `${key}="${escapeLabel(value)}"`)
		.join(",");

	return `{${formatted}}`;
}

/**
 * Formats numeric value for Prometheus output.
 *
 * @param value Numeric value to format.
 * @returns String representation handling NaN and Infinity.
 */
function formatValue(value: number): string {
	if (Number.isNaN(value)) return "NaN";
	if (!Number.isFinite(value)) return value > 0 ? "+Inf" : "-Inf";
	return String(value);
}

/**
 * Escapes special characters in HELP text.
 *
 * @param help Raw help text.
 * @returns Escaped help text.
 */
function escapeHelp(help: string): string {
	return help.replace(/\\/g, "\\\\").replace(/\n/g, "\\n");
}

/**
 * Escapes special characters in label values.
 *
 * @param value Raw label value.
 * @returns Escaped label value.
 */
function escapeLabel(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n");
}
