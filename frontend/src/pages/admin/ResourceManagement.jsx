
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Package,
  RefreshCw,
  AlertCircle,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  Boxes,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  X,
  Save,
} from "lucide-react";

import api from "../../services/api";


function SummaryCard({ title, value, icon: Icon, theme, subtitle }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`absolute -right-5 -top-5 h-24 w-24 rounded-full ${theme.glow}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${theme.icon}`}>
          <Icon size={22} />
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-1 w-full ${theme.line}`} />
    </div>
  );
}


function ResourceManagement() {
  const [resources, setResources] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingResourceId, setEditingResourceId] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] = useState(null);


  // Fetch all Owner-submitted resources
  const fetchResources = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/resources/");
      setResources(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Unable to load resources. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchResources();
  }, []);


  // Unique categories
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        resources
          .map((resource) => resource.category)
          .filter(Boolean)
      ),
    ];
  }, [resources]);


  // Search and filter
  const filteredResources = resources.filter((resource) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      resource.name?.toLowerCase().includes(searchText) ||
      resource.category?.toLowerCase().includes(searchText) ||
      resource.location?.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || resource.category === category;

    const matchesAvailability =
      availability === "All" ||
      (availability === "Available" && resource.is_available) ||
      (availability === "Unavailable" && !resource.is_available);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability
    );
  });


  // Summary values
  const availableCount = resources.filter(
    (item) => item.is_available
  ).length;

  const unavailableCount = resources.filter(
    (item) => !item.is_available
  ).length;

  const totalQuantity = resources.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );


  // Open Edit Form
  const openEditForm = (resource) => {
    setEditingResourceId(resource.id);

    setFormData({
      name: resource.name || "",
      category: resource.category || "",
      description: resource.description || "",
      location: resource.location || "",
      quantity: resource.quantity ?? 1,
      is_available: resource.is_available,
      requires_approval: resource.requires_approval,
    });

    setFormError("");
    setSuccess("");
  };


  // Close Edit Form
  const closeEditForm = () => {
    if (saving) return;

    setEditingResourceId(null);
    setFormData({});
    setFormError("");
  };


  // Handle form changes
  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "quantity"
            ? Number(value)
            : value,
    }));
  };


  // Update resource
  const handleUpdateResource = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    if (
      !Number.isInteger(formData.quantity) ||
      formData.quantity < 1
    ) {
      setFormError("Quantity must be a whole number of at least 1.");
      return;
    }

    setSaving(true);

    try {
      await api.put(
        `/api/resources/${editingResourceId}`,
        formData
      );

      setSuccess("Resource updated successfully.");

      closeEditForm();

      await fetchResources();
    } catch (err) {
      const detail = err.response?.data?.detail;

      setFormError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Unable to update resource. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };


  // Delete resource
  const handleDeleteResource = async (resource) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setSuccess("");
    setError("");
    setDeletingId(resource.id);

    try {
      await api.delete(`/api/resources/${resource.id}`);

      setSuccess("Resource deleted successfully.");

      await fetchResources();
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Unable to delete resource. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="space-y-7">

      {/* Heading Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1746a2] via-[#2563eb] to-[#4f46e5] p-6 text-white shadow-lg shadow-blue-200 sm:p-8">

        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[30px] border-white/10" />

        <div className="absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div className="max-w-xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              <Sparkles size={14} />
              Administration Workspace
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Resource Management
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-blue-100 sm:text-base">
              Monitor and manage resources submitted by institutional owners.
              Review resource details, update information and manage availability.
            </p>

            <div className="mt-6">

              <button
                onClick={fetchResources}
                disabled={loading || deletingId !== null}
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />

                Refresh Resources
              </button>

            </div>

          </div>

          <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm md:flex">
            <Boxes size={68} strokeWidth={1.3} />
          </div>

        </div>
      </section>


      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle size={19} />
          <span className="font-medium">{success}</span>
        </div>
      )}


      {/* Resource Overview */}
      <div>

        <div className="mb-4">

          <h2 className="text-lg font-bold text-slate-800">
            Resource Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview of resources submitted by Owners.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Resources"
            value={resources.length}
            subtitle="Owner-submitted resources"
            icon={Package}
            theme={{
              glow: "bg-blue-50",
              icon: "bg-blue-50 text-blue-600",
              line: "bg-blue-500",
            }}
          />

          <SummaryCard
            title="Available"
            value={availableCount}
            subtitle="Currently available resources"
            icon={CheckCircle}
            theme={{
              glow: "bg-emerald-50",
              icon: "bg-emerald-50 text-emerald-600",
              line: "bg-emerald-500",
            }}
          />

          <SummaryCard
            title="Unavailable"
            value={unavailableCount}
            subtitle="Currently unavailable resources"
            icon={XCircle}
            theme={{
              glow: "bg-red-50",
              icon: "bg-red-50 text-red-600",
              line: "bg-red-500",
            }}
          />

          <SummaryCard
            title="Total Units"
            value={totalQuantity}
            subtitle="Combined resource quantity"
            icon={Boxes}
            theme={{
              glow: "bg-violet-50",
              icon: "bg-violet-50 text-violet-600",
              line: "bg-violet-500",
            }}
          />

        </div>

      </div>


      {/* Search and Filters */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <Search size={19} />
          </div>

          <div>

            <h2 className="font-bold text-slate-800">
              Find Resources
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Search and filter Owner-submitted resources.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>


          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >

            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}

          </select>


          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >

            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>

          </select>

        </div>


        {(search || category !== "All" || availability !== "All") && (

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <p className="text-xs text-slate-500">
              Showing {filteredResources.length} matching resource(s).
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setAvailability("All");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>

          </div>

        )}

      </section>


      {/* Error Message */}
      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-center gap-3 text-red-700">

            <AlertCircle size={21} />

            <p className="text-sm font-medium">
              {error}
            </p>

          </div>

          <button
            onClick={fetchResources}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>

        </div>

      )}


      {/* Resource Table */}
      {!error && (

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <ClipboardList size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-800">
                  Owner-Submitted Resources
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredResources.length} resource(s) found
                </p>

              </div>

            </div>


            <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
              {resources.length} total entries
            </span>

          </div>


          {loading ? (

            <div className="flex flex-col items-center justify-center gap-3 py-16">

              <RefreshCw size={26} className="animate-spin text-blue-500" />

              <p className="text-sm text-slate-500">
                Loading resources...
              </p>

            </div>

          ) : filteredResources.length === 0 ? (

            <div className="py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Package size={32} className="text-slate-300" />
              </div>

              <p className="mt-4 font-semibold text-slate-700">
                No resources found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Owner-submitted resources will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-left text-sm">

                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-400">

                  <tr>

                    <th className="px-5 py-4 font-semibold">
                      Resource
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Location
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Quantity
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Approval
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Availability
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredResources.map((resource) => (

                    <tr
                      key={resource.id}
                      className="border-t border-slate-100 transition-colors hover:bg-blue-50/30"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Package size={19} />
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {resource.name}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                              {resource.description || "No description"}
                            </p>

                          </div>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          {resource.category}
                        </span>

                      </td>


                      <td className="px-5 py-4 text-slate-600">

                        <div className="flex items-center gap-1.5">

                          <MapPin
                            size={14}
                            className="shrink-0 text-slate-400"
                          />

                          <span>
                            {resource.location || "Not specified"}
                          </span>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <span className="font-semibold text-slate-700">
                          {resource.quantity}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            resource.requires_approval
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >

                          <ShieldCheck size={13} />

                          {resource.requires_approval
                            ? "Required"
                            : "Not Required"}

                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            resource.is_available
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              resource.is_available
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />

                          {resource.is_available
                            ? "Available"
                            : "Unavailable"}

                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() => openEditForm(resource)}
                            disabled={deletingId !== null}
                            title="Edit resource"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                          >

                            <Pencil size={14} />
                            Edit

                          </button>


                          <button
                            onClick={() => handleDeleteResource(resource)}
                            disabled={deletingId !== null}
                            title="Delete resource"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Trash2 size={14} />

                            {deletingId === resource.id
                              ? "Deleting..."
                              : "Delete"}

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      )}


      {/* Edit Resource Modal */}
      {editingResourceId !== null && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-6 text-white">

              <div className="absolute -right-8 -top-16 h-40 w-40 rounded-full border-[20px] border-white/10" />

              <div className="relative flex items-center justify-between">

                <div>

                  <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-blue-100">
                    <Package size={14} />
                    Resource Configuration
                  </div>

                  <h2 className="text-xl font-bold">
                    Edit Resource
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    Update the Owner-submitted resource details.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="rounded-xl bg-white/10 p-2.5 text-white transition hover:bg-white/20 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={21} />
                </button>

              </div>

            </div>


            <form
              onSubmit={handleUpdateResource}
              className="space-y-5 p-6"
            >

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Resource Name *
                  </label>

                  <input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleFormChange}
                    required
                    minLength={2}
                    maxLength={150}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category *
                  </label>

                  <input
                    name="category"
                    value={formData.category || ""}
                    onChange={handleFormChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description *
                </label>

                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleFormChange}
                  required
                  minLength={5}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

              </div>


              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location *
                  </label>

                  <input
                    name="location"
                    value={formData.location || ""}
                    onChange={handleFormChange}
                    required
                    minLength={2}
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity ?? 1}
                    onChange={handleFormChange}
                    required
                    min="1"
                    step="1"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              </div>


              <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Resource Settings
                </p>


                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 transition hover:bg-blue-50/50">

                  <input
                    type="checkbox"
                    name="is_available"
                    checked={Boolean(formData.is_available)}
                    onChange={handleFormChange}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <div>

                    <p className="text-sm font-medium text-slate-700">
                      Resource is currently available
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Allow eligible users to request this resource.
                    </p>

                  </div>

                </label>


                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 transition hover:bg-blue-50/50">

                  <input
                    type="checkbox"
                    name="requires_approval"
                    checked={Boolean(formData.requires_approval)}
                    onChange={handleFormChange}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <div>

                    <p className="text-sm font-medium text-slate-700">
                      Booking requires owner approval
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Requests must be approved before confirmation.
                    </p>

                  </div>

                </label>

              </div>


              {formError && (

                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">

                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{formError}</span>

                </div>

              )}


              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <Save size={17} />

                  {saving ? "Saving..." : "Update Resource"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ResourceManagement;
