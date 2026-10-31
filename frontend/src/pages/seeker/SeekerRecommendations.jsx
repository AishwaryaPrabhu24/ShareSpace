
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  MapPin,
  Package,
  RefreshCw,
  ArrowRight,
  BrainCircuit,
  SlidersHorizontal,
  AlertCircle,
  Lightbulb,
  Target,
  X,
  CalendarDays,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";

const suggestions = [
  "I need an oscilloscope for electronic circuit testing",
  "Looking for a 3D printer for prototype development",
  "I need a computer laboratory for programming",
  "Looking for a camera for photography",
];

export default function SeekerRecommendations() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState(5);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecommendations, setTotalRecommendations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [bookingResource, setBookingResource] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const [bookingForm, setBookingForm] = useState({
    start_time: "",
    end_time: "",
    purpose: "",
  });

  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setError("Please enter at least 2 characters describing your requirement.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(false);

      const response = await api.get("/api/recommendations/", {
        params: {
          q: trimmedQuery,
          top_n: topN,
        },
      });

      setRecommendations(response.data.recommendations || []);
      setSearchQuery(response.data.search_query || trimmedQuery);
      setTotalRecommendations(
        response.data.total_recommendations || 0
      );
      setSearched(true);
    } catch (err) {
      setRecommendations([]);
      setError(
        err.response?.data?.detail ||
          "Unable to generate recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setQuery(suggestion);
    setError("");
  };

  const clearSearch = () => {
    setQuery("");
    setRecommendations([]);
    setSearchQuery("");
    setTotalRecommendations(0);
    setSearched(false);
    setError("");
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
  };

  const closeBookingForm = () => {
    if (bookingLoading) return;

    setBookingResource(null);
    setBookingError("");
    setBookingSuccess("");
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!bookingResource?.resource_id) {
      setBookingError("Invalid resource selected. Please search again.");
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
        resource_id: bookingResource.resource_id,
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
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
          <BrainCircuit size={18} />
          Intelligent Resource Discovery
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          AI Resource Recommendations
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Describe what you need and let ShareSpace find matching resources.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
            <Sparkles size={18} />
            AI-POWERED RESOURCE MATCHING
          </div>

          <h2 className="mt-3 text-2xl font-bold">
            What resource are you looking for?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Enter your requirement in natural language. Our recommendation
            engine analyzes resource names, categories, descriptions and
            locations to identify relevant matches.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-5 p-6 sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Describe your requirement
            </label>

            <div className="relative">
              <textarea
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (error) setError("");
                }}
                rows={4}
                maxLength={1000}
                placeholder="Example: I need an oscilloscope for testing electronic circuits in the laboratory..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Be specific about the equipment or space you need.</span>
              <span>{query.length}/1000</span>
            </div>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Lightbulb size={15} />
              Try an example
            </p>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <SlidersHorizontal size={16} />
                Number of recommendations
              </label>

              <select
                value={topN}
                onChange={(event) => setTopN(Number(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              >
                {[3, 5, 10, 15, 20].map((number) => (
                  <option key={number} value={number}>
                    Top {number} resources
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Find Resources
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </form>
      </div>

      {!searched && !loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoCard
            icon={BrainCircuit}
            title="TF-IDF Analysis"
            description="Converts your search and resource descriptions into numerical text vectors."
          />

          <InfoCard
            icon={Target}
            title="Similarity Matching"
            description="Uses cosine similarity to identify and rank relevant resources."
          />

          <InfoCard
            icon={Package}
            title="Available Resources"
            description="Recommendations are generated from currently available resources."
          />
        </div>
      )}

      {searched && (
        <div className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recommendation Results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {totalRecommendations} matching resource
                {totalRecommendations === 1 ? "" : "s"} found.
              </p>
            </div>

            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <RefreshCw size={16} />
              New Search
            </button>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Your search
            </p>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              {searchQuery}
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No matching resources found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try using different keywords or describing the equipment
                and its intended use more specifically.
              </p>

              <button
                onClick={clearSearch}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Another Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {recommendations.map((resource, index) => (
                <RecommendationCard
                  key={resource.resource_id}
                  resource={resource}
                  rank={index + 1}
                  onViewResources={() => navigate("/seeker/resources")}
                  onBook={() => openBookingForm(resource)}
                />
              ))}
            </div>
          )}

          <p className="text-xs leading-5 text-slate-400">
            Similarity scores represent text-matching similarity calculated
            using TF-IDF and cosine similarity. They are not probabilities
            or guarantees of suitability. Confirm availability and eligibility
            before booking.
          </p>
        </div>
      )}

      {bookingResource && (
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
                  Resource ID: {bookingResource.resource_id}
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
                      ID: {bookingResource.resource_id} · {bookingResource.location}
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
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  resource,
  rank,
  onViewResources,
  onBook,
}) {
  const score = Math.max(
    0,
    Math.min(100, Number(resource.similarity_score) || 0)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            #{rank}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Recommended Resource
            </p>
            <p className="text-sm font-semibold text-slate-800">
              Resource ID: {resource.resource_id}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
          <p className="text-lg font-bold text-emerald-700">
            {score.toFixed(2)}%
          </p>
          <p className="text-[10px] font-semibold uppercase text-emerald-600">
            Similarity
          </p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {resource.category}
        </p>

        <h3 className="mt-2 text-lg font-bold text-slate-900">
          {resource.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {resource.description}
        </p>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <MapPin size={16} className="shrink-0 text-slate-400" />
          {resource.location}
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">
              Text similarity
            </span>
            <span className="font-bold text-slate-700">
              {score.toFixed(2)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <button
          onClick={onBook}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <CalendarDays size={16} />
          Book This Resource
        </button>

        <button
          onClick={onViewResources}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          Browse Resource Listings
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
