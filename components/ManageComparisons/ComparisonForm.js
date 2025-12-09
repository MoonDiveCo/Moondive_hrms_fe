"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, ArrowLeft, Upload } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import { CONNECT_US_SUBTITLE } from "@/text";   

const CATEGORIES = ['Mobile', 'Cloud', 'Frontend', 'Backend', 'Database', 'Process', 'Other'];

// axios base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MOONDIVE_API || process.env.NEXT_PUBLIC_API || "",
});

export default function ComparisonForm({ comparisonId = null, onClose = () => {}, onSaved = () => {} }) {
  const router = useRouter();
  // reused state & functions from your original form, adapted
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [additionalImageUploading, setAdditionalImageUploading] = useState(false);
  const [caseStudiesData, setCaseStudiesData] = useState([]);

  const containerRef = useRef(null);

  // body lock while modal open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // close on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // deepStripIds util (same as your original)
  const deepStripIds = (input) => {
    if (Array.isArray(input)) {
      return input.map((item) => deepStripIds(item));
    }
    if (input && typeof input === "object") {
      const result = {};
      Object.keys(input).forEach((key) => {
        if (key === "_id" || key === "__v" || key === "id") return;
        result[key] = deepStripIds(input[key]);
      });
      return result;
    }
    return input;
  };

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Mobile',
    metaDescription: '',
    featureImage: '',
    featureImageAlt: '',
    additionalImages: [],
    options: ['', ''],
    comparisonTable: { features: [] },
    introduction: '',
    detailedComparison: '',
    whenToUseEach: '',
    realWorldExamples: '',
    prosCons: [],
    decisionTree: [],
    faqs: [],
    relatedComparisons: [],
    relatedServicePages: [],
    status: 'draft',
    cta: {
      title: '',
      subtitle: '',
      button: '',
      link: '',
      caseStudyId: '',
      enabled: false
    },
  });

  // generate slug
  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // auto slug unless editing existing (only when creating new)
  useEffect(() => {
    if (formData.title && !comparisonId) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/comparisons/${comparisonId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });

      if (data.responseCode === 200) {
        const normalized = deepStripIds(data.result || {});
        const ensured = {
          options: Array.isArray(normalized.options) && normalized.options.length > 0 ? normalized.options : ['', ''],
          comparisonTable: { features: Array.isArray(normalized?.comparisonTable?.features) ? normalized.comparisonTable.features : [] },
          prosCons: Array.isArray(normalized.prosCons) ? normalized.prosCons : [],
          decisionTree: Array.isArray(normalized.decisionTree) ? normalized.decisionTree : [],
          faqs: Array.isArray(normalized.faqs) ? normalized.faqs : [],
          additionalImages: Array.isArray(normalized.additionalImages) ? normalized.additionalImages : [],
          cta: normalized.cta || {
            title: 'Cta Heading',
            subtitle: 'We have worked with some of the best innovative ideas and brands in the world across industries.',
            button: 'View Case Study',
            link: '/contact',
            caseStudyId: '',
            enabled: false
          },
          ...normalized,
        };
        setFormData(ensured);
      } else {
        toast.error(data.responseMessage || "Failed to fetch comparison");
      }
    } catch (err) {
      console.error("Error fetching comparison:", err);
      toast.error("Failed to fetch comparison");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (comparisonId) fetchComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonId]);

  const fetchCaseStudies = async () => {
    try {
      const res = await api.get("/admin/get-case-study?status=published", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      // adapt to your response structure
      setCaseStudiesData(res.data?.result || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load case studies");
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  // submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // validation (same as your original)
    if (!formData.title.trim()) { toast.error("Title is required"); return; }
    if (!formData.slug.trim()) { toast.error("Slug is required"); return; }
    if (formData.status === "published" && formData.additionalImages.length < 1) { toast.error("Atleast 1 additional image is required for publishing"); return; }
    if (formData.metaDescription.length > 160) { toast.error("Meta description must be 160 characters or less"); return; }
    if (formData.options.filter(o => o.trim()).length < 2) { toast.error("At least 2 options are required"); return; }
    if (formData.options.filter(o => o.trim()).length > 4) { toast.error("Maximum 4 options allowed"); return; }
    if (!formData.introduction.trim()) { toast.error("Introduction is required"); return; }
    if (formData.cta.enabled && !formData.cta.title.trim()) { toast.error("CTA title is required"); return; }
    if (formData.cta.enabled && (!formData.cta.button.trim() || !formData.cta.link.trim())) { toast.error("CTA button text and link are required"); return; }

    try {
      setLoading(true);

      const endpoint = comparisonId ? `/admin/comparisons/${comparisonId}` : `/admin/comparisons`;
      const method = comparisonId ? "put" : "post";

      const sanitized = deepStripIds(formData);
      if (Array.isArray(sanitized.additionalImages) && sanitized.additionalImages.length === 0) {
        delete sanitized.additionalImages;
      }

      const disallowedTopLevelFields = ['viewCount','createdAt','updatedAt','publishedAt','lastUpdated','formattedPublishedDate','formattedLastUpdated','__v','_id','id','author'];
      disallowedTopLevelFields.forEach(k => { if (k in sanitized) delete sanitized[k]; });

      if (sanitized?.comparisonTable?.features && Array.isArray(sanitized.comparisonTable.features)) {
        const allowedKeys = new Set((sanitized.options || []).filter(Boolean));
        sanitized.comparisonTable.features = sanitized.comparisonTable.features.map((feat) => {
          const nextValues = {};
          if (feat && typeof feat.values === 'object') {
            Object.keys(feat.values || {}).forEach((k) => { if (allowedKeys.has(k)) nextValues[k] = feat.values[k]; });
          }
          return { featureName: feat.featureName || '', values: nextValues };
        });
      }

      if (sanitized.cta) {
        sanitized.cta = {
          title: sanitized.cta.title || 'Expand Your Business',
          subtitle: sanitized.cta.subtitle || '',
          button: sanitized.cta.button || sanitized.cta.buttonText || '',
          link: sanitized.cta.buttonLink || sanitized.cta.link || '#',
          caseStudyId: sanitized.cta.caseStudyId || '',
          enabled: !!sanitized.cta.enabled,
        };
      }

      const res = await api[method](endpoint, sanitized, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });

      if (res.data?.responseCode === 200) {
        toast.success(res.data.responseMessage || `Comparison ${comparisonId ? "updated" : "created"} successfully`);
        onSaved();
      } else {
        toast.error(res.data?.responseMessage || "Failed to save comparison");
      }
    } catch (err) {
      console.error("Error saving comparison:", err);
      toast.error(err?.response?.data?.responseMessage || "Failed to save comparison");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image size should be less than 2MB"); return; }

    try {
      setImageUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(`/admin/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res.data?.responseCode === 200 && res.data.result?.url) {
        setFormData(prev => ({ ...prev, featureImage: res.data.result.url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(res.data?.responseMessage || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, featureImage: "", featureImageAlt: "" }));
    toast.success("Image removed");
  };

  const handleAdditionalImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image size should be less than 2MB"); return; }

    try {
      setAdditionalImageUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(`/admin/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res.data?.responseCode === 200 && res.data.result?.url) {
        const newImage = { url: res.data.result.url, alt: "", position: "after_introduction", caption: "" };
        setFormData(prev => ({ ...prev, additionalImages: [...(prev.additionalImages || []), newImage] }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error(res.data?.responseMessage || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setAdditionalImageUploading(false);
    }
  };

  const updateAdditionalImage = (index, field, value) => {
    setFormData(prev => ({ ...prev, additionalImages: prev.additionalImages.map((img,i) => i===index ? { ...img, [field]: value } : img) }));
  };

  const removeAdditionalImage = (index) => {
    setFormData(prev => ({ ...prev, additionalImages: prev.additionalImages.filter((_,i) => i!==index) }));
    toast.success("Image removed");
  };

  // Options
  const addOption = () => { if (formData.options.length < 4) setFormData(prev => ({ ...prev, options: [...prev.options, ''] })); };
  const removeOption = (index) => { if (formData.options.length > 2) setFormData(prev => ({ ...prev, options: prev.options.filter((_,i) => i!==index) })); };
  const updateOption = (index, value) => { setFormData(prev => ({ ...prev, options: prev.options.map((o,i) => i===index ? value : o) })); };

  // Comparison Table features
  const addFeature = () => {
    const newFeature = { featureName: '', values: formData.options.reduce((acc,opt)=>{ if(opt.trim()) acc[opt]=''; return acc; }, {}) };
    setFormData(prev => ({ ...prev, comparisonTable: { features: [...(prev.comparisonTable?.features||[]), newFeature] } }));
  };
  const removeFeature = (index) => setFormData(prev => ({ ...prev, comparisonTable: { features: prev.comparisonTable.features.filter((_,i)=>i!==index) } }));
  const updateFeature = (index, field, value) => {
    setFormData(prev => ({ ...prev, comparisonTable: { features: prev.comparisonTable.features.map((feat,i)=> { if(i===index){ if(field==='featureName') return { ...feat, featureName: value }; else return { ...feat, values: { ...feat.values, [field]: value } }; } return feat; }) } }));
  };

  // Pros/Cons
  const addProsCons = () => setFormData(prev => ({ ...prev, prosCons: [...prev.prosCons, { optionName: '', pros: [''], cons: [''] }] }));
  const removeProsCons = (index) => setFormData(prev => ({ ...prev, prosCons: prev.prosCons.filter((_,i)=>i!==index) }));
  const updateProsCons = (index, field, value) => setFormData(prev => ({ ...prev, prosCons: prev.prosCons.map((pc,i)=> i===index ? { ...pc, [field]: value } : pc) }));
  const addProConItem = (pcIndex, type) => setFormData(prev => ({ ...prev, prosCons: prev.prosCons.map((pc,i)=> i===pcIndex ? { ...pc, [type]: [...pc[type], ''] } : pc) }));
  const removeProConItem = (pcIndex, type, itemIndex) => setFormData(prev => ({ ...prev, prosCons: prev.prosCons.map((pc,i)=> i===pcIndex ? { ...pc, [type]: pc[type].filter((_,idx)=>idx!==itemIndex) } : pc) }));
  const updateProConItem = (pcIndex, type, itemIndex, value) => setFormData(prev => ({ ...prev, prosCons: prev.prosCons.map((pc,i)=> i===pcIndex ? { ...pc, [type]: pc[type].map((it,idx)=> idx===itemIndex ? value : it) } : pc) }));

  // Decision Tree
  const addDecisionItem = () => setFormData(prev => ({ ...prev, decisionTree: [...prev.decisionTree, { condition: '', recommendation: '', confidence: 'Medium' }] }));
  const removeDecisionItem = (index) => setFormData(prev => ({ ...prev, decisionTree: prev.decisionTree.filter((_,i)=>i!==index) }));
  const updateDecisionItem = (index, field, value) => setFormData(prev => ({ ...prev, decisionTree: prev.decisionTree.map((dt,i)=> i===index ? { ...dt, [field]: value } : dt) }));

  // FAQs
  const addFaq = () => setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
  const removeFaq = (index) => setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_,i)=>i!==index) }));
  const updateFaq = (index, field, value) => setFormData(prev => ({ ...prev, faqs: prev.faqs.map((f,i)=> i===index ? { ...f, [field]: value } : f) }));

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div ref={containerRef} className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh] hide-scrollbar overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-900">{comparisonId ? "Edit Comparison" : "Create New Comparison"}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFO */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input type="text" value={formData.title} onChange={(e)=> setFormData(prev=> ({...prev, title: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug *</label>
                  <input type="text" value={formData.slug} onChange={(e)=> setFormData(prev=> ({...prev, slug: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select value={formData.category} onChange={(e)=> setFormData(prev=> ({...prev, category: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={formData.status} onChange={(e)=> setFormData(prev=> ({...prev, status: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Description ({formData.metaDescription.length}/160)</label>
                  <textarea value={formData.metaDescription} onChange={(e)=> setFormData(prev=> ({...prev, metaDescription: e.target.value}))} rows={3} maxLength={160} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Feature image & Additional images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold mb-3">Feature Image</h3>
                {!formData.featureImage ? (
                  <div className="border-2 border-dashed p-6 rounded-lg text-center">
                    <input id="featureImage" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <label htmlFor="featureImage" className="cursor-pointer inline-flex items-center gap-2">
                      <Upload className="w-6 h-6" />
                      <span>{imageUploading ? "Uploading..." : "Click to upload image (PNG/JPG, <=2MB)"}</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <div className="relative w-full h-48 mb-3">
                      <Image src={formData.featureImage} alt={formData.featureImageAlt || "feature"} fill className="object-cover rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleRemoveImage} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg">Remove</button>
                    </div>
                  </div>
                )}

                {formData.featureImage && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-700">Image Alt Text</label>
                    <input type="text" value={formData.featureImageAlt} onChange={(e)=> setFormData(prev=> ({...prev, featureImageAlt: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Additional Images</h3>
                  <div>
                    <input id="additionalImage" type="file" accept="image/*" onChange={handleAdditionalImageUpload} className="hidden" />
                    <label htmlFor="additionalImage" className="px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer">{additionalImageUploading ? "Uploading..." : "Add Image"}</label>
                  </div>
                </div>

                {formData.additionalImages?.length > 0 ? (
                  <div className="space-y-4">
                    {formData.additionalImages.map((img, idx) => (
                      <div key={idx} className="flex gap-4 items-start border p-3 rounded-lg">
                        <div className="relative w-28 h-20 flex-shrink-0">
                          <Image src={img.url} alt={img.alt || `img-${idx}`} fill className="object-cover rounded-md" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <select value={img.position} onChange={(e) => updateAdditionalImage(idx, 'position', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                            <option value="after_introduction">After Introduction</option>
                            <option value="after_detailed_comparison">After In-Depth Analysis</option>
                            <option value="after_when_to_use">After When to Use Each</option>
                            <option value="after_real_world_examples">After Real World Examples</option>
                            <option value="after_comparison_table">After Comparison Table</option>
                            <option value="after_decision_guide">After Decision Guide</option>
                            <option value="before_faqs">Before FAQs</option>
                          </select>
                          <input value={img.alt} onChange={(e) => updateAdditionalImage(idx, 'alt', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Alt text" />
                          <input value={img.caption} onChange={(e) => updateAdditionalImage(idx, 'caption', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Caption (optional)" />
                        </div>
                        <div>
                          <button type="button" onClick={() => removeAdditionalImage(idx)} className="text-red-600"><Trash2 /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">No additional images yet.</p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Options Being Compared (2-4)</h3>
                {formData.options.length < 4 && <button type="button" onClick={addOption} className="px-3 py-1 bg-blue-600 text-white rounded-md"><Plus /></button>}
              </div>
              <div className="space-y-2">
                {formData.options.map((opt, idx) => (
                  <div className="flex gap-2" key={idx}>
                    <input value={opt} onChange={(e)=> updateOption(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder={`Option ${idx+1}`} />
                    {formData.options.length > 2 && <button type="button" onClick={()=> removeOption(idx)} className="text-red-600"><Trash2 /></button>}
                  </div>
                ))}
              </div>
            </div>

            {/* Content sections (introduction etc.) */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
              <h3 className="font-semibold">Content</h3>
              <div>
                <label className="text-sm text-gray-700">Introduction *</label>
                <textarea value={formData.introduction} onChange={(e)=> setFormData(prev=> ({...prev, introduction: e.target.value}))} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="text-sm text-gray-700">Detailed Comparison</label>
                <textarea value={formData.detailedComparison} onChange={(e)=> setFormData(prev=> ({...prev, detailedComparison: e.target.value}))} rows={4} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-700">When to Use Each</label>
                <textarea value={formData.whenToUseEach} onChange={(e)=> setFormData(prev=> ({...prev, whenToUseEach: e.target.value}))} rows={3} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Real-World Examples</label>
                <textarea value={formData.realWorldExamples} onChange={(e)=> setFormData(prev=> ({...prev, realWorldExamples: e.target.value}))} rows={3} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Comparison table */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Comparison Table</h3>
                <button type="button" onClick={addFeature} className="px-3 py-1 bg-blue-600 text-white rounded-md"><Plus /></button>
              </div>

              <div className="space-y-3">
                {formData.comparisonTable?.features?.map((feat, idx) => (
                  <div key={idx} className="border p-3 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <input value={feat.featureName} onChange={(e)=> updateFeature(idx, 'featureName', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Feature name" />
                      <button type="button" onClick={()=> removeFeature(idx)} className="text-red-600"><Trash2 /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {formData.options.filter(opt=>opt.trim()).map((optName, j)=> (
                        <div key={j}>
                          <label className="text-sm text-gray-600">{optName}</label>
                          <input value={feat.values?.[optName] || ''} onChange={(e)=> updateFeature(idx, optName, e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder={`Value for ${optName}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {formData.comparisonTable?.features?.length === 0 && <p className="text-gray-500 text-center py-4">No features yet.</p>}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Pros & Cons</h3>
                <button type="button" onClick={addProsCons} className="px-3 py-1 bg-blue-600 text-white rounded-md"><Plus /></button>
              </div>

              <div className="space-y-3">
                {formData.prosCons.length === 0 && <p className="text-gray-500 text-center py-4">No pros & cons added yet.</p>}
                {formData.prosCons.map((pc, pcIdx) => (
                  <div key={pcIdx} className="border p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <input value={pc.optionName} onChange={(e)=> updateProsCons(pcIdx, 'optionName', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Option name" />
                      <button type="button" onClick={()=> removeProsCons(pcIdx)} className="text-red-600"><Trash2 /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-2"><label className="text-sm text-green-700">Pros</label><button type="button" onClick={()=> addProConItem(pcIdx, 'pros')} className="text-blue-600 text-xs">+ Add</button></div>
                        <div className="space-y-2">
                          {pc.pros.map((p, i) => (
                            <div key={i} className="flex gap-2">
                              <input value={p} onChange={(e)=> updateProConItem(pcIdx, 'pros', i, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                              <button type="button" onClick={()=> removeProConItem(pcIdx, 'pros', i)} className="text-red-600"><Trash2 /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2"><label className="text-sm text-red-700">Cons</label><button type="button" onClick={()=> addProConItem(pcIdx, 'cons')} className="text-blue-600 text-xs">+ Add</button></div>
                        <div className="space-y-2">
                          {pc.cons.map((c, i) => (
                            <div key={i} className="flex gap-2">
                              <input value={c} onChange={(e)=> updateProConItem(pcIdx, 'cons', i, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                              <button type="button" onClick={()=> removeProConItem(pcIdx, 'cons', i)} className="text-red-600"><Trash2 /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Tree */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Decision Tree</h3>
                <button type="button" onClick={addDecisionItem} className="px-3 py-1 bg-blue-600 text-white rounded-md"><Plus /></button>
              </div>

              <div className="space-y-3">
                {formData.decisionTree.length === 0 && <p className="text-gray-500 text-center py-4">No decision rules yet.</p>}
                {formData.decisionTree.map((dt, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 border p-3 rounded-lg">
                    <input className="col-span-5 px-3 py-2 border rounded-lg" value={dt.condition} onChange={(e)=> updateDecisionItem(idx, 'condition', e.target.value)} placeholder="If condition" />
                    <input className="col-span-5 px-3 py-2 border rounded-lg" value={dt.recommendation} onChange={(e)=> updateDecisionItem(idx, 'recommendation', e.target.value)} placeholder="Then recommendation" />
                    <select className="col-span-1 px-2 py-2 border rounded-lg" value={dt.confidence} onChange={(e)=> updateDecisionItem(idx, 'confidence', e.target.value)}>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <div className="col-span-1">
                      <button type="button" onClick={()=> removeDecisionItem(idx)} className="text-red-600"><Trash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">FAQs</h3>
                <button type="button" onClick={addFaq} className="px-3 py-1 bg-blue-600 text-white rounded-md"><Plus /></button>
              </div>

              <div className="space-y-3">
                {formData.faqs.length === 0 && <p className="text-gray-500 text-center py-4">No FAQs yet.</p>}
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="border p-3 rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 px-3 py-2 border rounded-lg" value={faq.question} onChange={(e)=> updateFaq(idx, 'question', e.target.value)} placeholder="Question" />
                      <button type="button" onClick={()=> removeFaq(idx)} className="text-red-600"><Trash2 /></button>
                    </div>
                    <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} value={faq.answer} onChange={(e)=> updateFaq(idx, 'answer', e.target.value)} placeholder="Answer" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold mb-3">CTA</h3>
              <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={!!formData.cta?.enabled} onChange={(e)=> setFormData(prev => ({ ...prev, cta: { ...prev.cta, enabled: e.target.checked } }))} />
                <label>Enable CTA</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={formData.cta?.title || ''} onChange={(e)=> setFormData(prev=> ({...prev, cta: {...prev.cta, title: e.target.value}}))} className="px-3 py-2 border rounded-lg" placeholder="CTA Title" />
                <input value={formData.cta?.button || ''} onChange={(e)=> setFormData(prev=> ({...prev, cta: {...prev.cta, button: e.target.value}}))} className="px-3 py-2 border rounded-lg" placeholder="Button text" />
                <select value={formData.cta?.caseStudyId || ''} onChange={(e)=>{
                  const selected = e.target.value;
                  if (selected === 'connect-us') {
                    setFormData(prev => ({ ...prev, cta: { ...prev.cta, caseStudyId: 'connect-us', link: '/contact', button: 'Connect Us', subtitle: CONNECT_US_SUBTITLE } }));
                  } else {
                    const selectedCase = caseStudiesData.find(c => c._id === selected);
                    if (selectedCase) {
                      setFormData(prev => ({ ...prev, cta: { ...prev.cta, caseStudyId: selectedCase._id, link: `/case-study/${selectedCase.slug}`, button: 'View Case Study', subtitle: selectedCase.challengeSection?.subtitle || 'Discover how we solved real-world challenges.' } }));
                    }
                  }
                }} className="px-3 py-2 border rounded-lg">
                  <option value="">Select case study or Connect Us</option>
                  {caseStudiesData.map(st => <option key={st._id} value={st._id}>{st.client}</option>)}
                  <option value="connect-us">Connect Us</option>
                </select>

                <textarea value={formData.cta?.subtitle || ''} onChange={(e)=> setFormData(prev=> ({...prev, cta: {...prev.cta, subtitle: e.target.value}}))} className="px-3 py-2 border rounded-lg md:col-span-2" placeholder="CTA Subtitle" />
              </div>
            </div>

            {/* submit */}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                <Save /> {loading ? "Saving..." : "Save Comparison"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
