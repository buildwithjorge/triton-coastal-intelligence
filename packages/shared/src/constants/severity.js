export const severityOrder = ["Low", "Moderate", "Heavy", "Severe"];
export const severityLabels = {
    Low: "Minimal / Low",
    Moderate: "Light / Moderate",
    Heavy: "Moderate / Heavy",
    Severe: "Severe"
};
export const severityColors = {
    Low: "#00e676",
    Moderate: "#f5a623",
    Heavy: "#ff6b2b",
    Severe: "#ff3b5c"
};
export const tsiThresholds = {
    lowMax: 25,
    moderateMax: 50,
    heavyMax: 75,
    severeMax: 100
};
export function severityFromTsi(tsi) {
    if (tsi <= tsiThresholds.lowMax)
        return "Low";
    if (tsi <= tsiThresholds.moderateMax)
        return "Moderate";
    if (tsi <= tsiThresholds.heavyMax)
        return "Heavy";
    return "Severe";
}
export const cleanupStatusOrder = ["Clear", "Monitoring", "Scheduled", "Active", "Emergency"];
