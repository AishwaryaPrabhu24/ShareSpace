
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Boxes,
  RefreshCw,
  Filter,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  AlertCircle,
  SlidersHorizontal,
  CalendarDays,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

export default function SeekerResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingResource, setBookingResource] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [bookingForm, setBookingForm] = useState({
    start_time: "",
    end_time: "",
    purpose: "",
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/resources/");
      setResources(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load resources. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        resources.map((resource) => resource.category).filter(Boolean)
      ),
    ].sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        resource.name?.toLowerCase().includes(search) ||
        resource.category?.toLowerCase().includes(search) ||
        resource.location?.toLowerCase().includes(search) ||
        resource.description?.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "all" ||
        resource.category === selectedCategory;

      const isAvailable =
        resource.is_available && resource.quantity > 0;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && isAvailable) ||
        (availabilityFilter === "unavailable" && !isAvailable);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [resources, searchTerm, selectedCategory, availabilityFilter]);

  const availableCount = resources.filter(
    (resource) => resource.is_available && resource.quantity > 0
  ).length;

  const unavailableCount = resources.length - availableCount;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setAvailabilityFilter("all");
  };

  const openBookingForm = (resource) => {
    setBookingResource(resource);
    setBookingForm({
      start_time: "",
      end_time: "",
      purpose: "",
    });
    setBookingError("");
    setBookingSuccess("");
    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    if (bookingLoading) return;

    setShowBookingForm(false);
    setBookingResource(null);
    setBookingError("");
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!bookingResource?.id) {
      setBookingError("Please select a valid resource.");
      return;
    }

    if (!bookingForm.start_time || !bookingForm.end_time) {
      setBookingError("Please select both start and end times.");
      return;
    }

    const startDate = new Date(bookingForm.start_time);
    const endDate = new Date(bookingForm.end_time);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setBookingError("Please enter valid booking dates and times.");
      return;
    }

    if (endDate <= startDate) {
      setBookingError("End time must be later than start time.");
      return;
    }

    if (bookingForm.purpose.trim().length < 5) {
      setBookingError("Purpose must contain at least 5 characters.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");
      setBookingSuccess("");

      const payload = {
        resource_id: bookingResource.id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        purpose: bookingForm.purpose.trim(),
      };

      const response = await api.post("/api/bookings/", payload);

      setBookingSuccess(
        `Booking request #${response.data.id} submitted successfully.`
      );

      setBookingForm({
        start_time: "",
        end_time: "",
        purpose: "",
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setBookingError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item.msg).join(", ")
            : "Unable to submit your booking request. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Package size={17} />
            Resource Discovery
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Browse Resources
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Discover and explore shared institutional equipment and spaces.
          </p>
        </div>

        <button
          onClick={fetchResources}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Resources"
          value={resources.length}
          icon={Package}
          color="blue"
        />

        <SummaryCard
          title="Available Resources"
          value={availableCount}
          icon={CheckCircle2}
          color="emerald"
        />

        <SummaryCard
          title="Unavailable Resources"
          value={unavailableCount}
          icon={XCircle}
          color="orange"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-blue-600" />
          <h2 className="font-bold text-slate-900">Find a Resource</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, category, location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredResources.length}
            </span>{" "}
            of {resources.length} resources
          </p>

          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <X size={15} />
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={fetchResources}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading resources...
            </p>
          </div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Filter size={25} />
          </div>

          <h3 className="mt-4 font-semibold text-slate-800">
            No resources found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search term or filters.
          </p>

          <button
            onClick={clearFilters}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => {
            const available =
              resource.is_available && resource.quantity > 0;

            return (
              <div
                key={resource.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Package size={23} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      available
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {resource.category}
                  </p>

                  <h3 className="mt-2 line-clamp-1 text-lg font-bold text-slate-900">
                    {resource.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                    {resource.description}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{resource.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Boxes size={16} className="shrink-0 text-slate-400" />
                      Quantity: {resource.quantity}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ClipboardCheck
                        size={16}
                        className="shrink-0 text-slate-400"
                      />
                      {resource.requires_approval
                        ? "Owner approval required"
                        : "Automatic approval"}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedResource(resource)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                  >
                    <Eye size={17} />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedResource && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedResource(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                  {selectedResource.category}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {selectedResource.name}
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Resource ID: {selectedResource.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedResource.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Location"
                  value={selectedResource.location}
                />

                <DetailItem
                  label="Quantity"
                  value={selectedResource.quantity}
                />

                <DetailItem
                  label="Availability"
                  value={
                    selectedResource.is_available &&
                    selectedResource.quantity > 0
                      ? "Available"
                      : "Unavailable"
                  }
                />

                <DetailItem
                  label="Approval"
                  value={
                    selectedResource.requires_approval
                      ? "Required"
                      : "Automatic"
                  }
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Booking information
                </p>
                <p className="mt-1 text-sm leading-5 text-blue-700">
                  Booking requests are subject to resource availability,
                  eligibility requirements and the Owner's approval rules.
                </p>
              </div>

              <button
                disabled={
                  !selectedResource.is_available ||
                  selectedResource.quantity < 1
                }
                onClick={() => {
                  const resource = selectedResource;
                  setSelectedResource(null);
                  openBookingForm(resource);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <CalendarDays size={17} />
                Request Booking
              </button>

              <button
                onClick={() => setSelectedResource(null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookingForm && bookingResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeBookingForm}
        >
          <div
            className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between rounded-t-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
                  <CalendarDays size={17} />
                  Resource Booking
                </div>

                <h2 className="mt-2 text-xl font-bold">
                  Request a Booking
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  {bookingResource.name}
                </p>

                <p className="mt-1 text-xs text-blue-100">
                  Resource ID: {bookingResource.id}
                </p>
              </div>

              <button
                onClick={closeBookingForm}
                disabled={bookingLoading}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5 p-6">
              {bookingSuccess ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800">
                    <CheckCircle2 size={20} />
                    Booking Submitted
                  </div>

                  <p className="mt-2 text-sm text-emerald-700">
                    {bookingSuccess}
                  </p>

                  <p className="mt-2 text-sm text-emerald-700">
                    You can track the request in your My Bookings page.
                  </p>

                  <button
                    type="button"
                    onClick={closeBookingForm}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      Selected Resource
                    </p>
                    <p className="mt-1 text-sm text-blue-800">
                      {bookingResource.name}
                    </p>
                    <p className="mt-1 text-xs text-blue-700">
                      ID: {bookingResource.id} · {bookingResource.location}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock size={16} />
                      Start Date and Time
                    </label>

                    <input
                      type="datetime-local"
                      required
                      value={bookingForm.start_time}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          start_time: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock size={16} />
                      End Date and Time
                    </label>

                    <input
                      type="datetime-local"
                      required
                      min={bookingForm.start_time || undefined}
                      value={bookingForm.end_time}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          end_time: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Purpose of Booking
                    </label>

                    <textarea
                      required
                      minLength={5}
                      maxLength={500}
                      rows={3}
                      value={bookingForm.purpose}
                      onChange={(event) =>
                        setBookingForm((previous) => ({
                          ...previous,
                          purpose: event.target.value,
                        }))
                      }
                      placeholder="Explain why you need this resource..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {bookingForm.purpose.length}/500
                    </p>
                  </div>

                  {bookingError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Submit Booking Request
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-400">
                    Your request will be processed according to the resource
                    owner's approval settings.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value ?? "—"}
      </p>
    </div>
  );
}
