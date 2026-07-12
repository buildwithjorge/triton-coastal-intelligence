import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { createObservation, uploadObservationPhoto } from "../../lib/api";
const severityOptions = ["Low", "Moderate", "Heavy", "Severe"];
export function FieldObserverApp({ beaches, defaultBeachId, onSubmitted }) {
    const defaultBeach = useMemo(() => beaches.find((beach) => beach.id === defaultBeachId) ?? beaches[0], [beaches, defaultBeachId]);
    const [beachId, setBeachId] = useState(defaultBeach?.id ?? 1);
    const [observerName, setObserverName] = useState("Field Observer");
    const [severity, setSeverity] = useState("Moderate");
    const [notes, setNotes] = useState("");
    const [hasPhoto, setHasPhoto] = useState(false);
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const selectedBeach = beaches.find((beach) => beach.id === beachId) ?? defaultBeach;
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-teal", children: "Field Observer App" }), _jsx("h3", { className: "text-lg font-semibold", children: "Mobile Submission Workflow" }), _jsx("p", { className: "text-sm text-steel", children: "Capture beach conditions in real-time and push directly into Triton intelligence feeds." })] }), _jsxs("form", { className: "space-y-3", onSubmit: async (event) => {
                    event.preventDefault();
                    if (!selectedBeach)
                        return;
                    setSubmitting(true);
                    setMessage("");
                    try {
                        let uploadedPhotoUrl;
                        if (hasPhoto && photoFile) {
                            const dataUrl = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(String(reader.result));
                                reader.onerror = () => reject(new Error("Failed to read selected image"));
                                reader.readAsDataURL(photoFile);
                            });
                            const uploaded = await uploadObservationPhoto(photoFile.name, dataUrl);
                            uploadedPhotoUrl = uploaded.url;
                        }
                        await createObservation({
                            beachId,
                            observerName,
                            severity,
                            notes,
                            hasPhoto,
                            photoUrl: hasPhoto ? uploadedPhotoUrl ?? (photoUrl || undefined) : undefined,
                            lat: selectedBeach.lat,
                            lng: selectedBeach.lng
                        });
                        setNotes("");
                        setHasPhoto(false);
                        setPhotoUrl("");
                        setPhotoFile(null);
                        setMessage("Observation submitted successfully.");
                        if (onSubmitted) {
                            await onSubmitted(beachId);
                        }
                    }
                    catch (error) {
                        setMessage(error instanceof Error ? error.message : "Submission failed");
                    }
                    finally {
                        setSubmitting(false);
                    }
                }, children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs uppercase tracking-[0.15em] text-steel", children: "Beach" }), _jsx("select", { className: "w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice", value: beachId, onChange: (event) => setBeachId(Number(event.target.value)), children: beaches.map((beach) => (_jsx("option", { value: beach.id, children: beach.name }, beach.id))) })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs uppercase tracking-[0.15em] text-steel", children: "Observer" }), _jsx("input", { className: "w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice", value: observerName, onChange: (event) => setObserverName(event.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs uppercase tracking-[0.15em] text-steel", children: "Severity" }), _jsx("select", { className: "w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice", value: severity, onChange: (event) => setSeverity(event.target.value), children: severityOptions.map((option) => (_jsx("option", { value: option, children: option }, option))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs uppercase tracking-[0.15em] text-steel", children: "Notes" }), _jsx("textarea", { className: "h-24 w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice", placeholder: "Describe accumulation, odor, access impact, and recommended action...", value: notes, onChange: (event) => setNotes(event.target.value), required: true })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center", children: [_jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-steel", children: [_jsx("input", { type: "checkbox", checked: hasPhoto, onChange: (event) => setHasPhoto(event.target.checked) }), "Photo attached"] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("input", { type: "file", accept: "image/png,image/jpeg,image/webp", className: "w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice disabled:opacity-40", disabled: !hasPhoto, onChange: (event) => setPhotoFile(event.target.files?.[0] ?? null) }), _jsx("input", { className: "w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice disabled:opacity-40", placeholder: "Optional external image URL fallback", value: photoUrl, disabled: !hasPhoto, onChange: (event) => setPhotoUrl(event.target.value) })] })] }), hasPhoto && photoFile ? _jsxs("p", { className: "text-xs text-steel", children: ["Selected: ", photoFile.name] }) : null, _jsx("button", { type: "submit", className: "w-full rounded-md border border-teal bg-teal/20 px-3 py-2 text-sm font-medium uppercase tracking-[0.16em] text-teal disabled:opacity-50", disabled: submitting, children: submitting ? "Submitting..." : "Submit Observation" })] }), message ? _jsx("p", { className: "mt-3 text-sm text-steel", children: message }) : null] }));
}
