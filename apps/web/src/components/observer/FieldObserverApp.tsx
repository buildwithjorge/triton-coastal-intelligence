/**
 * Module: apps/web/src/components/observer/FieldObserverApp.tsx
 * Purpose: Mobile-first observer submission form wired to the live observations API.
 */

import type { Beach } from "@triton/shared";
import { useMemo, useState } from "react";
import { createObservation, uploadObservationPhoto } from "../../lib/api";

type Props = {
	beaches: Beach[];
	defaultBeachId?: number;
	onSubmitted?: (beachId: number) => Promise<void> | void;
};

const severityOptions = ["Low", "Moderate", "Heavy", "Severe"] as const;

export function FieldObserverApp({ beaches, defaultBeachId, onSubmitted }: Props) {
	const defaultBeach = useMemo(() => beaches.find((beach) => beach.id === defaultBeachId) ?? beaches[0], [beaches, defaultBeachId]);

	const [beachId, setBeachId] = useState<number>(defaultBeach?.id ?? 1);
	const [observerName, setObserverName] = useState<string>("Field Observer");
	const [severity, setSeverity] = useState<(typeof severityOptions)[number]>("Moderate");
	const [notes, setNotes] = useState<string>("");
	const [hasPhoto, setHasPhoto] = useState<boolean>(false);
	const [photoUrl, setPhotoUrl] = useState<string>("");
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");

	const selectedBeach = beaches.find((beach) => beach.id === beachId) ?? defaultBeach;

	return (
		<section className="panel rounded-2xl p-4">
			<div className="mb-4">
				<p className="text-xs uppercase tracking-[0.18em] text-teal">Field Observer App</p>
				<h3 className="text-lg font-semibold">Mobile Submission Workflow</h3>
				<p className="text-sm text-steel">Capture beach conditions in real-time and push directly into Triton intelligence feeds.</p>
			</div>

			<form
				className="space-y-3"
				onSubmit={async (event) => {
					event.preventDefault();
					if (!selectedBeach) return;

					setSubmitting(true);
					setMessage("");

					try {
						let uploadedPhotoUrl: string | undefined;
						if (hasPhoto && photoFile) {
							const dataUrl = await new Promise<string>((resolve, reject) => {
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
					} catch (error) {
						setMessage(error instanceof Error ? error.message : "Submission failed");
					} finally {
						setSubmitting(false);
					}
				}}
			>
				<div>
					<label className="mb-1 block text-xs uppercase tracking-[0.15em] text-steel">Beach</label>
					<select
						className="w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice"
						value={beachId}
						onChange={(event) => setBeachId(Number(event.target.value))}
					>
						{beaches.map((beach) => (
							<option key={beach.id} value={beach.id}>
								{beach.name}
							</option>
						))}
					</select>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<div>
						<label className="mb-1 block text-xs uppercase tracking-[0.15em] text-steel">Observer</label>
						<input
							className="w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice"
							value={observerName}
							onChange={(event) => setObserverName(event.target.value)}
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs uppercase tracking-[0.15em] text-steel">Severity</label>
						<select
							className="w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice"
							value={severity}
							onChange={(event) => setSeverity(event.target.value as (typeof severityOptions)[number])}
						>
							{severityOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className="mb-1 block text-xs uppercase tracking-[0.15em] text-steel">Notes</label>
					<textarea
						className="h-24 w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice"
						placeholder="Describe accumulation, odor, access impact, and recommended action..."
						value={notes}
						onChange={(event) => setNotes(event.target.value)}
						required
					/>
				</div>

				<div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
					<label className="inline-flex items-center gap-2 text-sm text-steel">
						<input type="checkbox" checked={hasPhoto} onChange={(event) => setHasPhoto(event.target.checked)} />
						Photo attached
					</label>

					<div className="grid gap-2">
						<input
							type="file"
							accept="image/png,image/jpeg,image/webp"
							className="w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice disabled:opacity-40"
							disabled={!hasPhoto}
							onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
						/>

						<input
							className="w-full rounded-md border border-border bg-panel-hi/70 px-3 py-2 text-sm text-ice disabled:opacity-40"
							placeholder="Optional external image URL fallback"
							value={photoUrl}
							disabled={!hasPhoto}
							onChange={(event) => setPhotoUrl(event.target.value)}
						/>
					</div>
				</div>

				{hasPhoto && photoFile ? <p className="text-xs text-steel">Selected: {photoFile.name}</p> : null}

				<button
					type="submit"
					className="w-full rounded-md border border-teal bg-teal/20 px-3 py-2 text-sm font-medium uppercase tracking-[0.16em] text-teal disabled:opacity-50"
					disabled={submitting}
				>
					{submitting ? "Submitting..." : "Submit Observation"}
				</button>
			</form>

			{message ? <p className="mt-3 text-sm text-steel">{message}</p> : null}
		</section>
	);
}
