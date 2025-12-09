"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ExecSummaryEditor({ title, categoryKey, moderation }) {
  const [summary, setSummary] = useState("");
  const [takeawaysText, setTakeawaysText] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const section = moderation?.[categoryKey] || {};

    setSummary(section.execSummary || "");
    setTakeawaysText(
      Array.isArray(section.keyTakeaways)
        ? section.keyTakeaways.join("\n")
        : ""
    );
  }, [moderation, categoryKey]);

  const onSave = async () => {
    try {
      setSaving(true);
      const keyTakeaways = takeawaysText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = { execSummary: summary, keyTakeaways };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/admin/edit-section/-1/${categoryKey}`,
        payload
      );

      // Refresh Moderation Data
      const refreshed = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/admin/moderation-data`,
        { cache: "no-store" }
      );

      const section = refreshed?.data?.result?.[categoryKey] || {};
      setSummary(section.execSummary || "");
      setTakeawaysText(
        Array.isArray(section.keyTakeaways)
          ? section.keyTakeaways.join("\n")
          : ""
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.log("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const onGenerate = async () => {
    try {
      setGenerating(true);

      const section = moderation?.[categoryKey] || {};
      const ctx = JSON.stringify({
        title: section.title || title,
        meta: section,
      });

      const prompt = `You are an expert product marketer. Generate:
1) A 3–5 sentence Executive Summary.
2) A list of 5 TLDR takeaways, each <12 words.
Return JSON with keys: execSummary, keyTakeaways[].
Context: ${ctx}`;

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/chat`,
        {
          userMessage: prompt,
          conversationHistory: [],
        }
      );

      const text = typeof data?.message === "string" ? data.message : "";

      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.execSummary) setSummary(parsed.execSummary);
        if (Array.isArray(parsed.keyTakeaways))
          setTakeawaysText(parsed.keyTakeaways.join("\n"));
      }
    } catch (err) {
      console.log("Generation failed", err);
    } finally {
      setGenerating(false);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-primaryText">
          {title} — Executive Summary
        </h4>

        <div className="flex items-center gap-3">
          <button
            onClick={onGenerate}
            disabled={generating}
            className="px-3 py-2 text-sm rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition disabled:opacity-60"
          >
            <span className="text-xs flex items-center">{generating ? "Generating…" : "Auto-Generate"}</span>
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-3 py-2 text-sm rounded-full bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60"
          >
            <span className="text-xs flex items-center">{saving ? "Saving…" : "Save"}</span>
          </button>

          {saved && (
            <span className="text-green-600 text-sm font-medium">Saved ✓</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <label className="text-gray-600 text-sm mb-1 block">
        Summary (3–5 sentences)
      </label>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={4}
        placeholder="Write a concise executive summary…"
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-primary focus:border-primary outline-none"
      />

      {/* TLDR */}
      <label className="text-gray-600 text-sm mt-4 mb-1 block">
        TLDR (one per line, 5 items)
      </label>
      <textarea
        value={takeawaysText}
        onChange={(e) => setTakeawaysText(e.target.value)}
        rows={5}
        placeholder="Start each takeaway on a new line…"
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-primary focus:border-primary outline-none"
      />
    </div>
  );
}
